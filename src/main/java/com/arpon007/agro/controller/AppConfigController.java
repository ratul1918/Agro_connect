package com.arpon007.agro.controller;

import com.arpon007.agro.repository.AppConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppConfigController {

    private final AppConfigRepository appConfigRepository;

    public AppConfigController(AppConfigRepository appConfigRepository) {
        this.appConfigRepository = appConfigRepository;
    }

    /**
     * Get public configurations (like delivery charges)
     */
    // Public endpoint to get specific configs (e.g. delivery charges)
    @GetMapping("/public/config")
    public ResponseEntity<Map<String, String>> getPublicConfig() {
        Map<String, String> configs = appConfigRepository.getAllConfigs();
        return ResponseEntity.ok(configs);
    }

}
