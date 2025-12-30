package com.arpon007.agro.controller;

import com.arpon007.agro.model.AIApiKey;
import com.arpon007.agro.service.ApiKeyManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/ai-keys")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class ApiKeyManagementController {

    private final ApiKeyManagementService apiKeyManagementService;

    @Autowired
    public ApiKeyManagementController(ApiKeyManagementService apiKeyManagementService) {
        this.apiKeyManagementService = apiKeyManagementService;
    }

    @GetMapping
    public ResponseEntity<List<AIApiKey>> getAllApiKeys() {
        List<AIApiKey> keys = apiKeyManagementService.getAllApiKeys();
        // Remove encrypted keys from response for security
        keys.forEach(key -> key.setApiKeyEncrypted("***"));
        return ResponseEntity.ok(keys);
    }

    @GetMapping("/{provider}")
    public ResponseEntity<Map<String, Object>> getApiKeyByProvider(@PathVariable String provider) {
        Optional<AIApiKey> apiKeyOpt = apiKeyManagementService.getApiKeyByProvider(provider);
        
        if (apiKeyOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("exists", false);
            response.put("provider", provider);
            response.put("message", "No API key found for this provider");
            return ResponseEntity.ok(response);
        }

        AIApiKey apiKey = apiKeyOpt.get();
        // Remove encrypted key for security
        apiKey.setApiKeyEncrypted("***");
        
        Map<String, Object> response = new HashMap<>();
        response.put("exists", true);
        response.put("apiKey", apiKey);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{provider}")
    public ResponseEntity<Map<String, Object>> saveApiKey(
            @PathVariable String provider,
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String apiKey = (String) request.get("apiKey");
            String keyTypeStr = (String) request.getOrDefault("keyType", "PRODUCTION");
            
            AIApiKey.KeyType keyType = AIApiKey.KeyType.valueOf(keyTypeStr.toUpperCase());
            
            // Get current admin user ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long createdBy = null; // You can extract user ID from auth if needed
            
            AIApiKey savedKey = apiKeyManagementService.saveApiKey(provider, apiKey, keyType, createdBy);
            
            // Remove encrypted key from response
            savedKey.setApiKeyEncrypted("***");
            
            response.put("success", true);
            response.put("message", "API key saved successfully for " + provider);
            response.put("apiKey", savedKey);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/{provider}")
    public ResponseEntity<Map<String, Object>> updateApiKey(
            @PathVariable String provider,
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String apiKey = (String) request.get("apiKey");
            String keyTypeStr = (String) request.getOrDefault("keyType", "PRODUCTION");
            
            AIApiKey.KeyType keyType = AIApiKey.KeyType.valueOf(keyTypeStr.toUpperCase());
            
            AIApiKey updatedKey = apiKeyManagementService.updateApiKey(provider, apiKey, keyType);
            
            // Remove encrypted key from response
            updatedKey.setApiKeyEncrypted("***");
            
            response.put("success", true);
            response.put("message", "API key updated successfully for " + provider);
            response.put("apiKey", updatedKey);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteApiKey(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            apiKeyManagementService.deleteApiKey(id);
            
            response.put("success", true);
            response.put("message", "API key deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleApiKeyStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isActive = request.getOrDefault("isActive", false);
            apiKeyManagementService.toggleApiKeyStatus(id, isActive);
            
            response.put("success", true);
            response.put("message", "API key status updated successfully");
            response.put("isActive", isActive);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update API key status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/{provider}/validate")
    public ResponseEntity<Map<String, Object>> validateApiKey(@PathVariable String provider) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isValid = apiKeyManagementService.validateApiKey(provider);
            
            response.put("success", true);
            response.put("isValid", isValid);
            response.put("message", isValid ? 
                "API key is valid and working" : 
                "API key validation failed");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to validate API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/providers")
    public ResponseEntity<Map<String, Object>> getSupportedProviders() {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> providers = new HashMap<>();
        providers.put("google", Map.of(
            "name", "Google Gemini",
            "description", "Google's Gemini AI model",
            "keyFormat", "Starts with 'AIza'",
            "validationUrl", "https://aistudio.google.com/app/apikey"
        ));
        
        providers.put("openrouter", Map.of(
            "name", "OpenRouter",
            "description", "Multi-model API gateway",
            "keyFormat", "Starts with 'sk-or-'",
            "validationUrl", "https://openrouter.ai/keys"
        ));
        
        providers.put("deepseek", Map.of(
            "name", "DeepSeek",
            "description", "DeepSeek AI models",
            "keyFormat", "Alphanumeric string",
            "validationUrl", "https://platform.deepseek.com/api_keys"
        ));
        
        response.put("providers", providers);
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
}