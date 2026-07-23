package com.nexushr.controller;

import com.nexushr.entity.Notification;
import com.nexushr.entity.Employee;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.service.NotificationService;
import com.nexushr.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final EmployeeRepository employeeRepository;

    private Employee getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications(@RequestHeader("Authorization") String token) {
        Long employeeId = getCurrentUser(token).getId();
        return ResponseEntity.ok(notificationService.getMyNotifications(employeeId));
    }

    @PutMapping("/me/read")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("Authorization") String token) {
        Long employeeId = getCurrentUser(token).getId();
        notificationService.markAllAsRead(employeeId);
        return ResponseEntity.ok().build();
    }
}
