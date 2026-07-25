package com.nexushr.config;

import com.nexushr.dto.SalaryComponentDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class SalaryTemplateConfig {

    private final Map<String, List<SalaryComponentDTO>> templates = new HashMap<>();

    public SalaryTemplateConfig() {
        initTemplates();
    }

    private void initTemplates() {
        // Base standard components
        List<SalaryComponentDTO> defaultTemplate = new ArrayList<>();
        defaultTemplate.add(createPercentageComponent("House Rent Allowance (HRA)", "EARNING", new BigDecimal("40")));
        defaultTemplate.add(createPercentageComponent("Provident Fund (PF)", "DEDUCTION", new BigDecimal("12")));
        defaultTemplate.add(createFixedComponent("Professional Tax", "DEDUCTION", new BigDecimal("200")));
        templates.put("DEFAULT", defaultTemplate);

        // Software Engineer Template
        List<SalaryComponentDTO> seTemplate = new ArrayList<>(defaultTemplate);
        seTemplate.add(createPercentageComponent("Internet Allowance", "EARNING", new BigDecimal("5")));
        templates.put("softwareengineer", seTemplate);

        // QA Engineer Template
        List<SalaryComponentDTO> qaTemplate = new ArrayList<>(defaultTemplate);
        qaTemplate.add(createPercentageComponent("Testing Allowance", "EARNING", new BigDecimal("5")));
        templates.put("qaengineer", qaTemplate);

        // HR Executive Template
        List<SalaryComponentDTO> hrTemplate = new ArrayList<>(defaultTemplate);
        hrTemplate.add(createPercentageComponent("Special Allowance", "EARNING", new BigDecimal("20")));
        templates.put("hrexecutive", hrTemplate);

        // Sales Executive Template
        List<SalaryComponentDTO> salesTemplate = new ArrayList<>(defaultTemplate);
        salesTemplate.add(createPercentageComponent("Sales Incentive", "EARNING", new BigDecimal("15")));
        salesTemplate.add(createPercentageComponent("Travel Allowance", "EARNING", new BigDecimal("10")));
        templates.put("salesexecutive", salesTemplate);
    }

    public List<SalaryComponentDTO> getTemplateForDesignation(String designationName) {
        if (designationName == null) {
            return templates.get("DEFAULT");
        }
        
        // Normalize name: lowercase and remove spaces for stable mapping
        String normalizedKey = designationName.toLowerCase().replaceAll("\\s+", "");
        
        return templates.getOrDefault(normalizedKey, templates.get("DEFAULT"));
    }

    private SalaryComponentDTO createPercentageComponent(String name, String type, BigDecimal value) {
        SalaryComponentDTO dto = new SalaryComponentDTO();
        dto.setName(name);
        dto.setComponentType(type);
        dto.setValueType("PERCENTAGE");
        dto.setComponentValue(value);
        return dto;
    }

    private SalaryComponentDTO createFixedComponent(String name, String type, BigDecimal value) {
        SalaryComponentDTO dto = new SalaryComponentDTO();
        dto.setName(name);
        dto.setComponentType(type);
        dto.setValueType("FIXED");
        dto.setComponentValue(value);
        return dto;
    }
}
