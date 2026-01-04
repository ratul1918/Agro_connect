package com.arpon007.agro.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * AI Service using Google Gemini API via HTTP.
 * Uses Gemini 2.0 Flash model for agricultural queries.
 */
@Service
public class AIService {

    @Value("${ai.gemini.api.key:}")
    private String geminiApiKey;

    @Value("${ai.system.prompt:You are Drac Agro AI, an agricultural expert assistant for Bangladesh. You help farmers with crop management, pest control, weather advice, and market information. Be helpful, accurate, and culturally aware.}")
    private String systemPrompt;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    /**
     * Get AI response for a user query
     */
    public String getResponse(String userQuery, boolean isBangla) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return isBangla
                    ? "দুঃখিত, AI সেবা কনফিগার করা হয়নি। অনুগ্রহ করে .env ফাইলে AI_GEMINI_KEY সেট করুন।"
                    : "Sorry, AI service is not configured. Please set AI_GEMINI_KEY in the .env file.";
        }

        try {
            String langInstruction = isBangla 
                    ? " Always respond in Bengali/Bangla language (বাংলা)."
                    : " Respond in English.";
            
            String fullPrompt = systemPrompt + langInstruction + "\n\nUser Question: " + userQuery;
            return callGeminiApi(fullPrompt, isBangla);

        } catch (Exception e) {
            e.printStackTrace();
            return isBangla 
                    ? "দুঃখিত, AI সার্ভিসে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।"
                    : "Sorry, there was an issue with the AI service. Please try again later.";
        }
    }

    private String callGeminiApi(String prompt, boolean isBangla) throws Exception {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(GEMINI_API_URL + "?key=" + geminiApiKey);
            httpPost.setHeader("Content-Type", "application/json; charset=UTF-8");

            ObjectNode root = objectMapper.createObjectNode();
            ArrayNode contents = root.putArray("contents");
            ObjectNode content = contents.addObject();
            content.put("role", "user");
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);

            ObjectNode generationConfig = root.putObject("generationConfig");
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 2048);

            httpPost.setEntity(new StringEntity(root.toString(), StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = client.execute(httpPost)) {
                int statusCode = response.getCode();
                String responseBody = new String(response.getEntity().getContent().readAllBytes(), StandardCharsets.UTF_8);

                if (statusCode != 200) {
                    throw new Exception("Gemini API returned status " + statusCode);
                }

                JsonNode responseNode = objectMapper.readTree(responseBody);

                if (responseNode.has("candidates") && responseNode.get("candidates").size() > 0) {
                    JsonNode candidate = responseNode.get("candidates").get(0);
                    if (candidate.has("content") && candidate.get("content").has("parts")) {
                        JsonNode partsNode = candidate.get("content").get("parts");
                        if (partsNode.size() > 0 && partsNode.get(0).has("text")) {
                            return partsNode.get(0).get("text").asText();
                        }
                    }
                }

                throw new Exception("Invalid response from Gemini API");
            }
        }
    }

    public boolean isConfigured() {
        return geminiApiKey != null && !geminiApiKey.isEmpty();
    }
}
