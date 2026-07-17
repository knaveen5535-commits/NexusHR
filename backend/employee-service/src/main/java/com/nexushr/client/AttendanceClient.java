package com.nexushr.client;

import com.nexushr.dto.performance.AttendanceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceClient {

    private final RestTemplate restTemplate;

    @Value("${payroll.service.url:http://localhost:8083}")
    private String payrollServiceUrl;

    public List<AttendanceDTO> getEmployeeAttendance(Long employeeId, LocalDate startDate, LocalDate endDate, String authHeader) {
        String url = String.format("%s/api/attendance/employee/%d?startDate=%s&endDate=%s", 
                payrollServiceUrl, employeeId, startDate.toString(), endDate.toString());
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            ResponseEntity<List<AttendanceDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<AttendanceDTO>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch attendance for employee {}: {}", employeeId, e.getMessage());
            // Return empty list or throw custom exception depending on requirements
            // Returning empty list means attendance score will be 0
            return List.of();
        }
    }
}
