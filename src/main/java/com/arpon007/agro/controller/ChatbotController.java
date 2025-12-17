package com.arpon007.agro.controller;

import com.arpon007.agro.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class ChatbotController {

    private final AIService aiService;

    public ChatbotController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        String lang = payload.getOrDefault("lang", "dn"); // default bn
        boolean isBangla = "bn".equalsIgnoreCase(lang);

        String response = aiService.getResponse(query, isBangla);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
