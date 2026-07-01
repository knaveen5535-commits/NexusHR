package com.nexushr.controller;

import com.nexushr.dto.ForgotPasswordRequest;
import com.nexushr.dto.LoginRequest;
import com.nexushr.dto.RegisterRequest;
import com.nexushr.dto.ResetPasswordRequest;
import com.nexushr.service.AuthService;
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
        return authService.login(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String>
    resetPassword(
            @RequestBody
            ResetPasswordRequest request) {

        return ResponseEntity.ok(
                authService.resetPassword(request)
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String>
    forgotPassword(
            @RequestBody
            ForgotPasswordRequest request) {

        return ResponseEntity.ok(
                authService.forgotPassword(request)
        );
    }
}