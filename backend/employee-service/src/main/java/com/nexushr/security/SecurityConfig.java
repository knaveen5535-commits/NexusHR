package com.nexushr.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/employees"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/employees/documents/**"
                        ).hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/employees/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/employees/me"
                        ).hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/employees/profile-requests/*/verify"
                        ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/employees/**"
                        ).hasAnyRole("ADMIN", "HR")

                        .requestMatchers(
                                "/api/employees/leaves/**"
                        ).hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/employees/me"
                        ).hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/employees/**",
                                "/api/employees"
                        ).hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/employees/manager/**"
                        ).hasAnyRole("ADMIN","HR","MANAGER")

                        .requestMatchers("/api/departments/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/api/designations/**").hasAnyRole("ADMIN", "HR", "MANAGER")

                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }
}