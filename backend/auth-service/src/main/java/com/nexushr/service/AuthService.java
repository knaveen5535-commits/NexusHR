package com.nexushr.service;

import com.nexushr.dto.*;
import com.nexushr.entity.PasswordResetToken;
import com.nexushr.entity.User;
import com.nexushr.enums.Role;
import com.nexushr.enums.Status;
import com.nexushr.exception.EmailAlreadyExistsException;
import com.nexushr.exception.InvalidCredentialsException;
import com.nexushr.exception.UserNotFoundException;
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

import java.time.LocalDateTime;
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

        /*
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Invalid password");
        }
        */

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );
        return token;
    }

    public String forgotPassword(
            ForgotPasswordRequest request) {

        User user =
                userRepository.findByEmail(
                        request.getEmail()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        String token =
                UUID.randomUUID().toString();

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setEmail(
                user.getEmail()
        );

        resetToken.setToken(token);

        resetToken.setExpiryTime(
                LocalDateTime.now().plusMinutes(15)
        );

        tokenRepository.save(resetToken);

        SimpleMailMessage mail =
                new SimpleMailMessage();

        mail.setTo(user.getEmail());
        mail.setSubject("Reset Password");
        mail.setText(
                "Use this token: " + token
        );

        mailSender.send(mail);

        return "Reset mail sent";
    }

    public String resetPassword(
            ResetPasswordRequest request) {

        PasswordResetToken resetToken =
                tokenRepository.findByToken(
                        request.getToken()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Invalid token"
                        ));

        if (resetToken.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Token expired"
            );
        }

        User user =
                userRepository.findByEmail(
                        resetToken.getEmail()
                ).orElseThrow();

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return "Password reset successful";
    }

    public String changePassword(
            ChangePasswordRequest request,
            String authHeader) {

        String token =
                authHeader.substring(7);

        Claims claims =
                jwtService.extractClaims(token);

        String email =
                claims.getSubject();


        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Old password incorrect"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "New password cannot be same as old password"
            );
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
}