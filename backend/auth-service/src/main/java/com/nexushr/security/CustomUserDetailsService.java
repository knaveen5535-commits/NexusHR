package com.nexushr.security;

import com.nexushr.entity.User;
import com.nexushr.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        long start = System.currentTimeMillis();
        System.out.println("[USER-DETAILS-SERVICE] Starting loadUserByUsername for email: " + email + " at: " + start);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        long end = System.currentTimeMillis();
        System.out.println("[USER-DETAILS-SERVICE] Finished loadUserByUsername at: " + end + ", duration: " + (end - start) + " ms");

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        )
                )
        );
    }
}