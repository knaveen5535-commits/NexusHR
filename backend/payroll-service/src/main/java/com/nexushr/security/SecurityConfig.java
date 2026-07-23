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

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/salary-structures").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/salary-structures/employee/*/history").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/salary-structures/employee/*").authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payrolls/generate",
                                "/api/payrolls/generate/bulk"
                        ).hasAnyRole("ADMIN", "HR")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payrolls/me",
                                "/api/payrolls/employee/**",
                                "/api/payrolls/*/payslip/download"
                        ).hasAnyRole("ADMIN", "HR", "EMPLOYEE", "MANAGER")
                        
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payrolls/team"
                        ).hasRole("MANAGER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payrolls",
                                "/api/payrolls/**"
                        ).hasAnyRole("ADMIN", "HR")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/payrolls/*/status"
                        ).hasAnyRole("ADMIN", "HR")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/payrolls/**"
                        ).hasRole("ADMIN")

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