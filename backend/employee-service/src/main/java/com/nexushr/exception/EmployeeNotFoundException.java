package com.nexushr.exception;

import org.springframework.web.bind.annotation.RestControllerAdvice;

public class EmployeeNotFoundException
        extends RuntimeException {

    public EmployeeNotFoundException(String message) {
        super(message);
    }
}