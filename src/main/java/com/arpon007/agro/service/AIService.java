package com.arpon007.agro.service;

import com.arpon007.agro.repository.AppConfigRepository;
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

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class AIService {

    @Value("${ai.openrouter.key}")
    private String openRouterKey;

    @Value("${ai.gemini.key}")
    private String geminiKey;

    private final AppConfigRepository configRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService(AppConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    public String getResponse(String userQuery, boolean isBangla) {
        String provider = configRepository.getValue("ai_provider", "openrouter");

        try {
            if ("google".equalsIgnoreCase(provider)) {
                return callGoogleGemini(userQuery, isBangla);
            }
            return callOpenRouter(userQuery, isBangla);
        } catch (Exception e) {
            e.printStackTrace();
            return isBangla ? "দুঃখিত, আমি এখন উত্তর দিতে পারছি না।" : "Sorry, I cannot answer right now.";
        }
    }

    private String callGoogleGemini(String query, boolean isBangla) throws IOException {
        String systemPrompt = configRepository.getValue("ai_system_prompt",
                "You are Drac Agro AI, an agricultural expert.");
        if (isBangla)
            systemPrompt += " Answer in Bangla.";

        String fullPrompt = systemPrompt + "\n\nUser Question: " + query;

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                            + geminiKey);
            httpPost.setHeader("Content-Type", "application/json");

            ObjectNode root = objectMapper.createObjectNode();
            ArrayNode contents = root.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", fullPrompt);

            httpPost.setEntity(new StringEntity(root.toString(), StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = client.execute(httpPost)) {
                String responseBody = new String(response.getEntity().getContent().readAllBytes(),
                        StandardCharsets.UTF_8);
                JsonNode responseNode = objectMapper.readTree(responseBody);

                if (responseNode.has("candidates") && responseNode.get("candidates").size() > 0) {
                    JsonNode candidate = responseNode.get("candidates").get(0);
                    if (candidate.has("content") && candidate.get("content").has("parts")) {
                        return candidate.get("content").get("parts").get(0).get("text").asText();
                    }
                }
                System.err.println("Google AI Error: " + responseBody);
                throw new IOException("Google AI returned invalid response");
            }
        }
    }

    private String callOpenRouter(String query, boolean isBangla) throws IOException {
        String defaultPrompt = "You are Drac Agro AI, an agricultural expert.";
        String systemPrompt = configRepository.getValue("ai_system_prompt", defaultPrompt);
        String model = configRepository.getValue("ai_model", "meta-llama/llama-3.1-8b-instruct:free");

        // Safety check for broken/deprecated model IDs
        if (model.contains("gemini-2.0") || model.isEmpty()) {
            model = "meta-llama/llama-3.1-8b-instruct:free";
        }

        if (isBangla) {
            systemPrompt += " Answer in Bangla.";
        }

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost("https://openrouter.ai/api/v1/chat/completions");
            httpPost.setHeader("Authorization", "Bearer " + openRouterKey);
            httpPost.setHeader("Content-Type", "application/json");
            // Add HTTP Referer/Title for OpenRouter rankings (optional but good practice)
            httpPost.setHeader("HTTP-Referer", "http://localhost:5173");
            httpPost.setHeader("X-Title", "Agro Connect");

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);

            ArrayNode messages = requestBody.putArray("messages");
            messages.addObject().put("role", "system").put("content", systemPrompt);
            messages.addObject().put("role", "user").put("content", query);

            httpPost.setEntity(new StringEntity(requestBody.toString(), StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = client.execute(httpPost)) {
                String responseBody = new String(response.getEntity().getContent().readAllBytes(),
                        StandardCharsets.UTF_8);

                JsonNode responseNode = objectMapper.readTree(responseBody);
                if (responseNode.has("choices") && responseNode.get("choices").size() > 0) {
                    return responseNode.get("choices").get(0).get("message").get("content").asText();
                } else if (responseNode.has("error")) {
                    String errorMsg = responseNode.get("error").get("message").asText();
                    System.err.println("AI Provider Error: " + errorMsg);
                    throw new IOException("AI Provider Error: " + errorMsg);
                }

                // Fallback for unexpected success structure
                System.out.println("Unexpected AI Response: " + responseBody);
                throw new IOException("Empty or invalid AI response");
            }
        }
    }
}
