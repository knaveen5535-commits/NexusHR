package com.nexushr.service;

import com.nexushr.dto.RegisterRequest;
import com.nexushr.entity.User;
import com.nexushr.enums.Status;
import com.nexushr.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setStatus(Status.ACTIVE);

        userRepository.save(user);

        return "User Registered Successfully";
    }
}