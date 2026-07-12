package com.nexushr.service;

import com.nexushr.dto.DesignationResponse;
import com.nexushr.entity.Designation;
import com.nexushr.enums.Role;
import com.nexushr.repository.DesignationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;

    public DesignationService(DesignationRepository designationRepository) {
        this.designationRepository = designationRepository;
    }

    public List<DesignationResponse> getDesignations(Long departmentId, Role type) {
        List<Designation> designations;

        if (departmentId != null && type != null) {
            designations = designationRepository.findByDepartmentIdAndDesignationType(departmentId, type);
        } else if (departmentId != null) {
            designations = designationRepository.findByDepartmentId(departmentId);
        } else if (type != null) {
            designations = designationRepository.findByDesignationType(type);
        } else {
            designations = designationRepository.findAll();
        }

        return designations.stream()
                .map(d -> new DesignationResponse(
                        d.getId(),
                        d.getDesignationName(),
                        d.getDepartment() != null ? d.getDepartment().getId() : null,
                        d.getDesignationType(),
                        d.isActive()
                ))
                .collect(Collectors.toList());
    }

    public DesignationResponse createDesignation(com.nexushr.dto.CreateDesignationRequest request) {
        com.nexushr.entity.Designation desig = new com.nexushr.entity.Designation();
        desig.setDesignationName(request.getDesignationName());
        desig.setDesignationType(request.getDesignationType());
        
        com.nexushr.entity.Department dept = new com.nexushr.entity.Department();
        dept.setId(request.getDepartmentId());
        desig.setDepartment(dept);
        
        desig.setActive(true);
        desig = designationRepository.save(desig);
        
        return new DesignationResponse(desig.getId(), desig.getDesignationName(), desig.getDepartment().getId(), desig.getDesignationType(), desig.isActive());
    }

    public DesignationResponse updateDesignation(Long id, com.nexushr.dto.UpdateDesignationRequest request) {
        com.nexushr.entity.Designation desig = designationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Designation not found"));
        
        if (request.getDesignationName() != null) {
            desig.setDesignationName(request.getDesignationName());
        }
        if (request.getDesignationType() != null) {
            desig.setDesignationType(request.getDesignationType());
        }
        if (request.getDepartmentId() != null) {
            com.nexushr.entity.Department dept = new com.nexushr.entity.Department();
            dept.setId(request.getDepartmentId());
            desig.setDepartment(dept);
        }
        desig = designationRepository.save(desig);
        return new DesignationResponse(desig.getId(), desig.getDesignationName(), desig.getDepartment() != null ? desig.getDepartment().getId() : null, desig.getDesignationType(), desig.isActive());
    }

    public DesignationResponse toggleStatus(Long id) {
        com.nexushr.entity.Designation desig = designationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Designation not found"));
        desig.setActive(!desig.isActive());
        desig = designationRepository.save(desig);
        return new DesignationResponse(desig.getId(), desig.getDesignationName(), desig.getDepartment() != null ? desig.getDepartment().getId() : null, desig.getDesignationType(), desig.isActive());
    }

    public void deleteDesignation(Long id) {
        if (!designationRepository.existsById(id)) {
            throw new RuntimeException("Designation not found");
        }
        designationRepository.deleteById(id);
    }
}
