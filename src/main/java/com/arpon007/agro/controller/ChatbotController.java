package com.arpon007.agro.controller;

import com.arpon007.agro.service.AIService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class ChatbotController {

    private final AIService aiService;

    public ChatbotController(AIService aiService) {
        this.aiService = aiService;
    }

    /**
     * Handle JSON requests
     */
    @PostMapping(value = "/chat", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> chatJson(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        String lang = payload.getOrDefault("lang", "bn");
        boolean isBangla = "bn".equalsIgnoreCase(lang);

        String response = aiService.getResponse(query, isBangla);
        return ResponseEntity.ok(Map.of("response", response));
    }

    /**
     * Handle multipart form data requests (with optional image)
     */
    @PostMapping(value = "/chat", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> chatMultipart(
            @RequestParam("query") String query,
            @RequestParam(value = "lang", defaultValue = "bn") String lang,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        boolean isBangla = "bn".equalsIgnoreCase(lang);

        // If image is provided, add context about it
        String fullQuery = query;
        if (image != null && !image.isEmpty()) {
            fullQuery = "User has attached an image. " + query;
            // TODO: In future, implement image analysis with vision models
        }

        String response = aiService.getResponse(fullQuery, isBangla);
        return ResponseEntity.ok(Map.of("response", response));
    }

    /**
     * Health check endpoint to test if AI service is responding
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            // Simple test to see if the service can respond
            String testResponse = aiService.getResponse("Say 'OK' if you can hear me", false);
            boolean isWorking = testResponse != null && !testResponse.isEmpty()
                    && !testResponse.contains("not configured")
                    && !testResponse.contains("সমস্যা");

            return ResponseEntity.ok(Map.of(
                    "status", isWorking ? "healthy" : "degraded",
                    "aiServiceAvailable", isWorking,
                    "message", isWorking ? "AI service is operational" : "AI service is not fully configured"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "status", "unhealthy",
                    "aiServiceAvailable", false,
                    "message", "AI service error: " + e.getMessage()));
        }
    }

    /**
     * Quick test endpoint (no actual API call, just checks configuration)
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "service", "Agro AI Chat",
                "model", "Gemini 1.5 Flash",
                "endpoint", "/api/ai/chat",
                "supportedLanguages", new String[] { "en", "bn" }));
    }
}
