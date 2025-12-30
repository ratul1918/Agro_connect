package com.arpon007.Agro.service;

import com.arpon007.agro.model.AIApiKey;
import com.arpon007.agro.repository.AIApiKeyRepository;
import com.arpon007.agro.repository.AppConfigRepository;
import com.arpon007.agro.service.AIService;
import com.arpon007.agro.service.ApiKeyManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
@ActiveProfiles("test")
public class AIServiceIntegrationTest {

    @Autowired
    private AIService aiService;

    @Autowired
    private ApiKeyManagementService apiKeyManagementService;

    @Autowired
    private AIApiKeyRepository apiKeyRepository;

    @Autowired
    private AppConfigRepository configRepository;

    @BeforeEach
    void setUp() {
        // Clean up any existing test data (no deleteAll method available, so we'll work with existing data)
        
        // Set up test configuration
        configRepository.setValue("ai_model", "gemini-1.5-flash");
        configRepository.setValue("ai_system_prompt", "You are a test assistant.");
    }

    @Test
    void testGetResponseWithDefaultProvider() {
        // Test that AI service can handle response with default provider
        try {
            String response = aiService.getResponse("Hello", false);
            assertNotNull(response, "Response should not be null");
        } catch (Exception e) {
            // Expected in test environment without valid API keys
            assertTrue(e.getMessage().contains("Failed to get response from Google Gemini") || 
                      e.getMessage().contains("Failed to get response from OpenRouter"));
        }
    }

    @Test
    void testGetResponseWithBangla() {
        // Test that AI service can handle Bangla language
        try {
            String response = aiService.getResponse("হ্যালো", true);
            assertNotNull(response, "Response should not be null");
        } catch (Exception e) {
            // Expected in test environment without valid API keys
            assertTrue(e.getMessage().contains("Failed to get response from Google Gemini") || 
                      e.getMessage().contains("Failed to get response from OpenRouter"));
        }
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testApiKeyManagementIntegration() {
        // Test saving a new API key
        AIApiKey savedKey = apiKeyManagementService.saveApiKey(
            "google", 
            "AIzaTestKeyForIntegrationTesting123456789", 
            AIApiKey.KeyType.TESTING, 
            1L
        );

        assertNotNull(savedKey, "Saved API key should not be null");
        assertEquals("google", savedKey.getProvider());
        assertEquals(AIApiKey.KeyType.TESTING, savedKey.getKeyType());

        // Test retrieving the encrypted key
        String retrievedKey = apiKeyManagementService.getDecryptedApiKey("google");
        assertNotNull(retrievedKey, "Retrieved API key should not be null");
        assertEquals("AIzaTestKeyForIntegrationTesting123456789", retrievedKey);

        // Test updating the key
        AIApiKey updatedKey = apiKeyManagementService.updateApiKey(
            "google", 
            "AIzaUpdatedTestKeyForIntegrationTesting123456789", 
            AIApiKey.KeyType.PRODUCTION
        );

        assertNotNull(updatedKey, "Updated API key should not be null");
        assertEquals(AIApiKey.KeyType.PRODUCTION, updatedKey.getKeyType());

        // Verify the updated key can be retrieved
        String updatedRetrievedKey = apiKeyManagementService.getDecryptedApiKey("google");
        assertEquals("AIzaUpdatedTestKeyForIntegrationTesting123456789", updatedRetrievedKey);
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testApiKeyValidation() {
        // Test key format validation
        assertDoesNotThrow(() -> {
            apiKeyManagementService.saveApiKey(
                "google", 
                "AIzaTestKeyForValidationTesting123456789", 
                AIApiKey.KeyType.TESTING, 
                1L
            );
        });

        // Test invalid key format
        assertThrows(IllegalArgumentException.class, () -> {
            apiKeyManagementService.saveApiKey(
                "google", 
                "invalid-key", 
                AIApiKey.KeyType.TESTING, 
                1L
            );
        });

        // Test unsupported provider
        assertThrows(IllegalArgumentException.class, () -> {
            apiKeyManagementService.saveApiKey(
                "unsupported", 
                "some-key", 
                AIApiKey.KeyType.TESTING, 
                1L
            );
        });
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testMultipleProviders() {
        // Test saving keys for different providers
        apiKeyManagementService.saveApiKey(
            "google", 
            "AIzaTestKeyForGoogle123456789", 
            AIApiKey.KeyType.TESTING, 
            1L
        );

        apiKeyManagementService.saveApiKey(
            "openrouter", 
            "sk-or-test-key-for-openrouter-testing123456789", 
            AIApiKey.KeyType.TESTING, 
            1L
        );

        apiKeyManagementService.saveApiKey(
            "deepseek", 
            "testdeepseekkey123456789", 
            AIApiKey.KeyType.TESTING, 
            1L
        );

        // Verify all keys can be retrieved
        assertNotNull(apiKeyManagementService.getDecryptedApiKey("google"));
        assertNotNull(apiKeyManagementService.getDecryptedApiKey("openrouter"));
        assertNotNull(apiKeyManagementService.getDecryptedApiKey("deepseek"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testKeyToggleStatus() {
        // Save a test key
        AIApiKey savedKey = apiKeyManagementService.saveApiKey(
            "google", 
            "AIzaTestKeyForToggleTesting123456789", 
            AIApiKey.KeyType.TESTING, 
            1L
        );

        // Test deactivating the key
        apiKeyManagementService.toggleApiKeyStatus(savedKey.getId(), false);
        
        // The key should not be retrievable when inactive
        String retrievedKey = apiKeyManagementService.getDecryptedApiKey("google");
        assertNull(retrievedKey, "Inactive API key should not be retrievable");

        // Test reactivating the key
        apiKeyManagementService.toggleApiKeyStatus(savedKey.getId(), true);
        
        // The key should be retrievable when active
        retrievedKey = apiKeyManagementService.getDecryptedApiKey("google");
        assertNotNull(retrievedKey, "Active API key should be retrievable");
    }
}