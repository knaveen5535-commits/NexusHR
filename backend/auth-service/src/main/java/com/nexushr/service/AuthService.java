package com.nexushr.service;

import com.nexushr.dto.*;
import com.nexushr.entity.PasswordResetToken;
import com.nexushr.entity.User;
import com.nexushr.enums.Role;
import com.nexushr.enums.Status;
import com.nexushr.exception.EmailAlreadyExistsException;
import com.nexushr.exception.InvalidCredentialsException;
import com.nexushr.exception.UserNotFoundException;
import com.nexushr.exception.RoleMismatchException;
import com.nexushr.exception.InvalidTokenException;
import com.nexushr.exception.TokenExpiredException;
import com.nexushr.repository.PasswordResetTokenRepository;
import com.nexushr.repository.UserRepository;
import com.nexushr.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:2500}")
    private String frontendUrl;


    public AuthService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {

        this.userRepository = userRepository;
        this.passwordEncoder=passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public String createUser(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(Status.ACTIVE);
        user.setFirstLogin(true);
        userRepository.save(user);

        return "Admin Registered Successfully";
    }


    public String registerAdmin(RegisterRequest request) {

        if (request.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only ADMIN role allowed");
        }

        //request.setRole(Role.ADMIN);
        return createUser(request);
    }

    public String login(LoginRequest request) {

        long start = System.currentTimeMillis();
        System.out.println("[AUTH-SERVICE] Starting authenticationManager.authenticate at: " + start);

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        long afterAuth = System.currentTimeMillis();
        System.out.println("[AUTH-SERVICE] Finished authenticationManager.authenticate at: " + afterAuth + ", duration: " + (afterAuth - start) + " ms");

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (request.getExpectedRole() != null && !request.getExpectedRole().trim().isEmpty()) {
            String expectedRole = request.getExpectedRole().trim().toUpperCase();
            String dbRole = user.getRole().name().toUpperCase();
            if (!expectedRole.equals(dbRole)) {
                throw new RoleMismatchException("These credentials belong to an " + dbRole + " account. Please use the " + 
                    expectedRole.substring(0, 1) + expectedRole.substring(1).toLowerCase() + " portal.");
            }
        }

        long beforeJwt = System.currentTimeMillis();
        System.out.println("[AUTH-SERVICE] Starting JWT generation at: " + beforeJwt);

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
        
        long afterJwt = System.currentTimeMillis();
        System.out.println("[AUTH-SERVICE] Finished JWT generation at: " + afterJwt + ", duration: " + (afterJwt - beforeJwt) + " ms");

        return token;
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            throw new UserNotFoundException("No account found with this email address.");
        }

        // Invalidate old active tokens
        List<PasswordResetToken> activeTokens = tokenRepository.findByUserAndUsedFalse(user);
        activeTokens.forEach(t -> {
            t.setUsed(true);
            t.setUsedAt(LocalDateTime.now());
        });
        tokenRepository.saveAll(activeTokens);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiryTime(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(resetToken);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("NexusHR - Password Reset Request");

            String resetLink = frontendUrl + "/reset-password?token=" + token;

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                    "<h2 style='color: #2563eb;'>NexusHR Password Reset</h2>" +
                    "<p>Hello,</p>" +
                    "<p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>" +
                    "<p>Click the button below to reset your password (valid for 15 minutes):</p>" +
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='" + resetLink + "' style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Reset Password</a>" +
                    "</div>" +
                    "<p>Or copy this link into your browser:</p>" +
                    "<p style='color: #6b7280; font-size: 14px; word-break: break-all;'>" + resetLink + "</p>" +
                    "<p>Best regards,<br/>NexusHR Team</p>" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new RuntimeException("Failed to send email due to a server error. Please try again later.");
        }

        return "Password reset link has been sent to your email.";
    }

    public String resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or non-existent token"));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new InvalidTokenException("This password reset token has already been used.");
        }

        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("This password reset token has expired.");
        }

        User user = resetToken.getUser();

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New Password must not be the same as the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);

        return "Password reset successful";
    }

    public String changePassword(
            ChangePasswordRequest request,
            String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization token is missing or invalid");
        }

        String token = authHeader.substring(7);

        Claims claims =
                jwtService.extractClaims(token);

        String email =
                claims.getSubject();


        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException("Old password incorrect");
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be same as old password");
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        user.setFirstLogin(false);
        userRepository.save(user);

        return "Password changed successfully";
    }

    public String updateUserRole(UpdateUserRoleRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setRole(request.getRole());
        userRepository.save(user);
        return "User role updated successfully";
    }

    public boolean validateResetToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);
        if (resetToken == null) {
            return false;
        }
        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            return false;
        }
        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }
        return true;
    }
}