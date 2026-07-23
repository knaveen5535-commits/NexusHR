package com.nexushr.controller;

import com.nexushr.repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final SalaryStructureRepository repository;

    @GetMapping("/db-check")
    public String checkDb() {
        long count = repository.count();
        return "Total Salary Structures in DB: " + count;
    }
}
