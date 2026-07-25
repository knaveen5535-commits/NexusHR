package com.nexushr.service;

import com.nexushr.dto.SalaryComponentDTO;
import com.nexushr.dto.SalaryStructureDTO;
import com.nexushr.entity.SalaryComponent;
import com.nexushr.entity.SalaryStructure;
import com.nexushr.enums.ComponentType;
import com.nexushr.enums.ValueType;
import com.nexushr.repository.SalaryStructureRepository;
import com.nexushr.config.SalaryTemplateConfig;
import com.nexushr.dto.AutoProvisionRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SalaryStructureService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final SalaryTemplateConfig salaryTemplateConfig;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            // Drop the old unique constraint to allow multiple historical records (SCD Type 2)
            jdbcTemplate.execute("ALTER TABLE salary_structures DROP CONSTRAINT IF EXISTS unique_employee_structure");
            jdbcTemplate.execute("ALTER TABLE salary_structures DROP CONSTRAINT IF EXISTS uk_salary_structure_employee_id");
            jdbcTemplate.execute("ALTER TABLE salary_structures DROP CONSTRAINT IF EXISTS salary_structures_employee_id_key");
        } catch (Exception e) {
            System.err.println("Note: Could not drop unique constraint (it may have already been dropped). " + e.getMessage());
        }
    }

    @Transactional
    public SalaryStructureDTO autoProvisionSalaryStructure(AutoProvisionRequestDTO request) {
        // If an active structure already exists, skip to avoid overwriting existing data
        if (salaryStructureRepository.findActiveStructureByEmployeeId(request.getEmployeeId()).isPresent()) {
            return null; 
        }

        List<SalaryComponentDTO> templateComponents = salaryTemplateConfig.getTemplateForDesignation(request.getDesignationName());

        SalaryStructureDTO structureDTO = new SalaryStructureDTO();
        structureDTO.setEmployeeId(request.getEmployeeId());
        structureDTO.setBaseSalary(request.getBaseSalary() != null ? request.getBaseSalary() : BigDecimal.ZERO);
        structureDTO.setEffectiveFrom(LocalDate.now().toString());
        structureDTO.setComponents(templateComponents);

        return createSalaryStructure(structureDTO);
    }

    @Transactional
    public SalaryStructureDTO createSalaryStructure(SalaryStructureDTO dto) {
        // Map DTO to Entity
        SalaryStructure newStructure = new SalaryStructure();
        newStructure.setEmployeeId(dto.getEmployeeId());
        newStructure.setBaseSalary(dto.getBaseSalary());
        newStructure.setEffectiveFrom(dto.getEffectiveFrom() != null ? LocalDate.parse(dto.getEffectiveFrom()) : LocalDate.now());
        newStructure.setIsActive(true);

        if (dto.getComponents() != null) {
            List<SalaryComponent> components = dto.getComponents().stream().map(c -> {
                SalaryComponent component = new SalaryComponent();
                component.setName(c.getName());
                component.setComponentType(ComponentType.valueOf(c.getComponentType().toUpperCase()));
                component.setValueType(ValueType.valueOf(c.getValueType().toUpperCase()));
                component.setComponentValue(c.getComponentValue());
                component.setSalaryStructure(newStructure);
                return component;
            }).collect(Collectors.toList());
            newStructure.setComponents(components);
        }

        // Deactivate old active structure
        salaryStructureRepository.findActiveStructureByEmployeeId(dto.getEmployeeId())
                .ifPresent(oldStructure -> {
                    oldStructure.setIsActive(false);
                    oldStructure.setEndDate(LocalDate.now().minusDays(1));
                    salaryStructureRepository.save(oldStructure);
                });

        SalaryStructure saved = salaryStructureRepository.save(newStructure);
        return mapToDTO(saved);
    }

    public SalaryStructureDTO getActiveStructure(Long employeeId) {
        SalaryStructure structure = salaryStructureRepository.findActiveStructureByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("No active salary structure found"));
        return mapToDTO(structure);
    }

    public List<SalaryStructureDTO> getStructureHistory(Long employeeId) {
        return salaryStructureRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SalaryStructureDTO mapToDTO(SalaryStructure entity) {
        SalaryStructureDTO dto = new SalaryStructureDTO();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployeeId());
        dto.setBaseSalary(entity.getBaseSalary());
        dto.setEffectiveFrom(entity.getEffectiveFrom() != null ? entity.getEffectiveFrom().toString() : null);
        dto.setEndDate(entity.getEndDate() != null ? entity.getEndDate().toString() : null);
        dto.setIsActive(entity.getIsActive());

        if (entity.getComponents() != null) {
            List<SalaryComponentDTO> components = entity.getComponents().stream().map(c -> {
                SalaryComponentDTO cdto = new SalaryComponentDTO();
                cdto.setId(c.getId());
                cdto.setName(c.getName());
                cdto.setComponentType(c.getComponentType().name());
                cdto.setValueType(c.getValueType().name());
                cdto.setComponentValue(c.getComponentValue());
                return cdto;
            }).collect(Collectors.toList());
            dto.setComponents(components);
        }
        return dto;
    }
}
