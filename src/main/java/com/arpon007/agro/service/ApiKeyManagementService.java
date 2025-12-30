package com.arpon007.agro.service;

import com.arpon007.agro.model.AIApiKey;
import com.arpon007.agro.repository.AIApiKeyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class ApiKeyManagementService {

    private final AIApiKeyRepository apiKeyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Simple XOR encryption key - in production, use proper AES encryption
    private static final String ENCRYPTION_KEY = "agro-ai-encryption-key-2024";

    @Autowired
    public ApiKeyManagementService(AIApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    public List<AIApiKey> getAllApiKeys() {
        return apiKeyRepository.findAll();
    }

    public Optional<AIApiKey> getApiKeyByProvider(String provider) {
        return apiKeyRepository.findActiveByProvider(provider);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public AIApiKey saveApiKey(String provider, String plainApiKey, AIApiKey.KeyType keyType, Long createdBy) {
        // Check if provider already exists
        if (apiKeyRepository.existsByProvider(provider)) {
            throw new IllegalArgumentException("API key for provider " + provider + " already exists. Please update the existing key.");
        }

        // Validate key format
        validateApiKeyFormat(provider, plainApiKey);

        // Encrypt the API key
        String encryptedKey = encryptApiKey(plainApiKey);

        AIApiKey apiKey = new AIApiKey(provider, encryptedKey, keyType, createdBy);
        apiKey.setValidationStatus(AIApiKey.ValidationStatus.PENDING);
        
        return apiKeyRepository.save(apiKey);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public AIApiKey updateApiKey(String provider, String plainApiKey, AIApiKey.KeyType keyType) {
        Optional<AIApiKey> existingKeyOpt = apiKeyRepository.findByProvider(provider);
        if (existingKeyOpt.isEmpty()) {
            throw new IllegalArgumentException("No API key found for provider: " + provider);
        }

        // Validate key format
        validateApiKeyFormat(provider, plainApiKey);

        AIApiKey existingKey = existingKeyOpt.get();
        existingKey.setApiKeyEncrypted(encryptApiKey(plainApiKey));
        existingKey.setKeyType(keyType);
        existingKey.setValidationStatus(AIApiKey.ValidationStatus.PENDING);
        existingKey.setLastValidated(null);
        
        return apiKeyRepository.save(existingKey);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void deleteApiKey(Long id) {
        apiKeyRepository.deleteById(id);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void toggleApiKeyStatus(Long id, boolean isActive) {
        apiKeyRepository.toggleActiveStatus(id, isActive);
    }

    public String getDecryptedApiKey(String provider) {
        Optional<AIApiKey> apiKeyOpt = apiKeyRepository.findActiveByProvider(provider);
        if (apiKeyOpt.isEmpty()) {
            return null;
        }
        
        return decryptApiKey(apiKeyOpt.get().getApiKeyEncrypted());
    }

    public boolean validateApiKey(String provider) {
        Optional<AIApiKey> apiKeyOpt = apiKeyRepository.findByProvider(provider);
        if (apiKeyOpt.isEmpty()) {
            return false;
        }

        AIApiKey apiKey = apiKeyOpt.get();
        String decryptedKey = decryptApiKey(apiKey.getApiKeyEncrypted());
        
        boolean isValid = testApiConnection(provider, decryptedKey);
        
        AIApiKey.ValidationStatus status = isValid ? 
            AIApiKey.ValidationStatus.VALID : 
            AIApiKey.ValidationStatus.INVALID;
        
        apiKeyRepository.updateValidationStatus(apiKey.getId(), status);
        
        return isValid;
    }

    private void validateApiKeyFormat(String provider, String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be empty");
        }

        switch (provider.toLowerCase()) {
            case "google":
            case "gemini":
                if (!apiKey.startsWith("AIza") || apiKey.length() < 35) {
                    throw new IllegalArgumentException("Invalid Google/Gemini API key format");
                }
                break;
            case "openrouter":
                if (!apiKey.startsWith("sk-or-") || apiKey.length() < 40) {
                    throw new IllegalArgumentException("Invalid OpenRouter API key format");
                }
                break;
            case "deepseek":
                if (apiKey.length() < 40 || !apiKey.matches("^[a-zA-Z0-9-]+$")) {
                    throw new IllegalArgumentException("Invalid DeepSeek API key format");
                }
                break;
            default:
                throw new IllegalArgumentException("Unsupported AI provider: " + provider);
        }
    }

    private boolean testApiConnection(String provider, String apiKey) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            switch (provider.toLowerCase()) {
                case "google":
                case "gemini":
                    return testGoogleGeminiKey(apiKey);
                case "openrouter":
                    return testOpenRouterKey(apiKey);
                case "deepseek":
                    return testDeepSeekKey(apiKey);
                default:
                    return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private boolean testGoogleGeminiKey(String apiKey) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey);
            httpPost.setHeader("Content-Type", "application/json");

            String testBody = """
                {
                  "contents": [{
                    "parts": [{
                      "text": "Hello"
                    }]
                  }]
                }
                """;
            
            httpPost.setEntity(new StringEntity(testBody, StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = client.execute(httpPost)) {
                int statusCode = response.getCode();
                return statusCode == 200;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private boolean testOpenRouterKey(String apiKey) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost("https://openrouter.ai/api/v1/auth/keys");
            httpPost.setHeader("Authorization", "Bearer " + apiKey);
            httpPost.setHeader("Content-Type", "application/json");

            try (CloseableHttpResponse response = client.execute(httpPost)) {
                int statusCode = response.getCode();
                return statusCode == 200;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private boolean testDeepSeekKey(String apiKey) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost("https://api.deepseek.com/v1/models");
            httpPost.setHeader("Authorization", "Bearer " + apiKey);
            httpPost.setHeader("Content-Type", "application/json");

            try (CloseableHttpResponse response = client.execute(httpPost)) {
                int statusCode = response.getCode();
                return statusCode == 200;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private String encryptApiKey(String plainText) {
        try {
            byte[] keyBytes = ENCRYPTION_KEY.getBytes(StandardCharsets.UTF_8);
            byte[] textBytes = plainText.getBytes(StandardCharsets.UTF_8);
            byte[] encrypted = new byte[textBytes.length];
            
            for (int i = 0; i < textBytes.length; i++) {
                encrypted[i] = (byte) (textBytes[i] ^ keyBytes[i % keyBytes.length]);
            }
            
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt API key", e);
        }
    }

    private String decryptApiKey(String encryptedText) {
        try {
            byte[] keyBytes = ENCRYPTION_KEY.getBytes(StandardCharsets.UTF_8);
            byte[] encrypted = Base64.getDecoder().decode(encryptedText);
            byte[] decrypted = new byte[encrypted.length];
            
            for (int i = 0; i < encrypted.length; i++) {
                decrypted[i] = (byte) (encrypted[i] ^ keyBytes[i % keyBytes.length]);
            }
            
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt API key", e);
        }
    }
}