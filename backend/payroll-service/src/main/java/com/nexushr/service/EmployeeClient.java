package com.nexushr.service;

import com.nexushr.dto.EmployeeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeClient {

    private final RestTemplate restTemplate;

    @Value("${employee.service.url:http://localhost:8082/api/employees}")
    private String employeeServiceUrl;

    public EmployeeDTO getEmployeeById(Long employeeId) {
        try {
            String url = employeeServiceUrl + "/" + employeeId;
            
            HttpHeaders headers = new HttpHeaders();
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null) {
                    headers.set("Authorization", authHeader);
                }
            }
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            return restTemplate.exchange(url, HttpMethod.GET, entity, EmployeeDTO.class).getBody();
        } catch (Exception e) {
            log.error("Failed to fetch employee details for ID: {}", employeeId, e);
            // Return a fallback DTO to avoid breaking the UI
            EmployeeDTO fallback = new EmployeeDTO();
            fallback.setId(employeeId);
            fallback.setFirstName("Unknown");
            fallback.setLastName("Employee");
            fallback.setDesignation("Unknown Position");
            return fallback;
        }
    }

    public java.util.List<EmployeeDTO> getTeamMembers() {
        try {
            String url = employeeServiceUrl + "/manager/team";
            HttpHeaders headers = new HttpHeaders();
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null) {
                    headers.set("Authorization", authHeader);
                }
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            org.springframework.http.ResponseEntity<java.util.List<EmployeeDTO>> response = 
                restTemplate.exchange(
                    url, 
                    HttpMethod.GET, 
                    entity, 
                    new org.springframework.core.ParameterizedTypeReference<java.util.List<EmployeeDTO>>() {}
                );
            return response.getBody() != null ? response.getBody() : java.util.Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch team members", e);
            return java.util.Collections.emptyList();
        }
    }
}
