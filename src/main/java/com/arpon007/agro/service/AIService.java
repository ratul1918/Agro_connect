package com.arpon007.agro.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * AI Service using the official Google GenAI SDK.
 * Uses Gemini 2.5 Flash model for agricultural queries.
 * API key is loaded from environment variable GEMINI_API_KEY.
 */
@Service
public class AIService {

    @Value("${ai.gemini.api.key:}")
    private String geminiApiKey;

    @Value("${ai.system.prompt:You are Drac Agro AI, an agricultural expert assistant for Bangladesh. You help farmers with crop management, pest control, weather advice, and market information. Be helpful, accurate, and culturally aware.}")
    private String systemPrompt;

    private static final String GEMINI_MODEL = "gemini-2.5-flash";

    /**
     * Get AI response for a user query
     * 
     * @param userQuery The user's question
     * @param isBangla  Whether to respond in Bangla
     * @return AI response text
     */
    public String getResponse(String userQuery, boolean isBangla) {
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return isBangla
                    ? "দুঃখিত, AI সেবা কনফিগার করা হয়নি। অনুগ্রহ করে .env ফাইলে GEMINI_API_KEY সেট করুন।"
                    : "Sorry, AI service is not configured. Please set GEMINI_API_KEY in the .env file.";
        }

        try {
            // Build the prompt with language instruction
            String langInstruction = isBangla
                    ? " Always respond in Bengali/Bangla language (বাংলা)."
                    : " Respond in English.";

            String fullPrompt = systemPrompt + langInstruction + "\n\nUser Question: " + userQuery;

            // Create client with API key
            Client client = Client.builder().apiKey(geminiApiKey).build();

            // Generate content using Gemini 2.5 Flash
            GenerateContentResponse response = client.models.generateContent(
                    GEMINI_MODEL,
                    fullPrompt,
                    null);

            String responseText = response.text();

            if (responseText == null || responseText.isEmpty()) {
                return isBangla
                        ? "দুঃখিত, AI উত্তর দিতে পারেনি। পরে আবার চেষ্টা করুন।"
                        : "Sorry, AI could not generate a response. Please try again.";
            }

            return responseText;

        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage();

            if (errorMsg != null && errorMsg.contains("API_KEY")) {
                return isBangla
                        ? "দুঃখিত, API Key সমস্যা। অনুগ্রহ করে সঠিক GEMINI_API_KEY সেট করুন।"
                        : "Sorry, API Key issue. Please set a valid GEMINI_API_KEY.";
            }

            return isBangla
                    ? "দুঃখিত, AI সার্ভিসে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।"
                    : "Sorry, there was an issue with the AI service. Please try again later.";
        }
    }

    /**
     * Test if the Gemini API is configured and working
     * 
     * @return true if working, false otherwise
     */
    public boolean isConfigured() {
        return geminiApiKey != null && !geminiApiKey.isEmpty();
    }

    /**
     * Test the API connection
     * 
     * @return TestResult with success status and message
     */
    public TestResult testConnection() {
        if (!isConfigured()) {
            return new TestResult(false, "GEMINI_API_KEY is not set in environment variables", null);
        }

        try {
            Client client = Client.builder().apiKey(geminiApiKey).build();

            GenerateContentResponse response = client.models.generateContent(
                    GEMINI_MODEL,
                    "Say OK",
                    null);

            String responseText = response.text();
            if (responseText != null && !responseText.isEmpty()) {
                return new TestResult(true, "Gemini API is working!", responseText);
            }
            return new TestResult(false, "API returned empty response", null);

        } catch (Exception e) {
            return new TestResult(false, "API test failed: " + e.getMessage(), null);
        }
    }

    /**
     * Result class for API testing
     */
    public static class TestResult {
        private final boolean success;
        private final String message;
        private final String response;

        public TestResult(boolean success, String message, String response) {
            this.success = success;
            this.message = message;
            this.response = response;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public String getResponse() {
            return response;
        }
    }
}
