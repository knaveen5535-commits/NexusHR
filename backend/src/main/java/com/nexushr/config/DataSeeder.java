package com.nexushr.config;

import com.nexushr.entity.Role;
import com.nexushr.entity.User;
import com.nexushr.repository.RoleRepository;
import com.nexushr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("Demo3").isEmpty()) {
            User user = new User();
            user.setUsername("Demo3");
            user.setEmail("demo3@nexushr.com");
            user.setPassword(passwordEncoder.encode("demo321"));

            Role role = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);

            userRepository.save(user);
            System.out.println("Default user 'Demo3' with password 'demo321' has been created!");
        }
    }
}
