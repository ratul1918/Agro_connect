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
}
