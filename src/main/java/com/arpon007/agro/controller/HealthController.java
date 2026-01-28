package com.arpon007.agro.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String home() {
        return "Agro Connect API is running and healthy. Visit /health for status.";
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "All is running";
    }
}
