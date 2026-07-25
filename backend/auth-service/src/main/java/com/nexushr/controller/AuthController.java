package com.nexushr.controller;

import com.nexushr.dto.*;
import com.nexushr.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/create-user")
    public ResponseEntity<String> createUser(
            @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.createUser(request)
        );
    }

    @PostMapping("/register-admin")
    public ResponseEntity<String> registerAdmin(
            @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.registerAdmin(request)
        );
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {
        long startTime = System.currentTimeMillis();
        System.out.println("[AUTH-CONTROLLER] Received login request at: " + startTime);
        try {
            return authService.login(request);
        } finally {
            long endTime = System.currentTimeMillis();
            System.out.println("[AUTH-CONTROLLER] Completed login request at: " + endTime + ", duration: " + (endTime - startTime) + " ms");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String>
    resetPassword(
            @Valid @RequestBody
            ResetPasswordRequest request) {

        return ResponseEntity.ok(
                authService.resetPassword(request)
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String>
    forgotPassword(
            @Valid @RequestBody
            ForgotPasswordRequest request) {

        return ResponseEntity.ok(
                authService.forgotPassword(request)
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {

        String authHeader =
                httpRequest.getHeader(
                        "Authorization"
                );

        return ResponseEntity.ok(
                authService.changePassword(
                        request,
                        authHeader
                )
        );
    }

    @PostMapping("/update-role")
    public ResponseEntity<String> updateRole(
            @RequestBody UpdateUserRoleRequest request) {

        return ResponseEntity.ok(
                authService.updateUserRole(request)
        );
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<Boolean> validateResetToken(@RequestParam("token") String token) {
        return ResponseEntity.ok(
                authService.validateResetToken(token)
        );
    }
}