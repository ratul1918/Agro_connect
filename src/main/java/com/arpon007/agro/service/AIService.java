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

    @Value("${ai.gemini.api.key:}")
    private String geminiKey;

    @Value("${ai.system.prompt:You are Drac Agro AI, an agricultural expert.}")
    private String systemPrompt;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService() {
    }

    public String getResponse(String userQuery, boolean isBangla) {
        try {
            // Check if Gemini API key is configured
            if (geminiKey == null || geminiKey.isEmpty()) {
                return isBangla
                        ? "দুঃখিত, AI সেবা কনফিগার করা হয়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।"
                        : "Sorry, AI service is not configured. Please contact the administrator.";
            }
            
            return callGoogleGemini(userQuery, isBangla, geminiKey);
        } catch (Exception e) {
            e.printStackTrace();
            return isBangla ? "দুঃখিত, আমি এখন উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন।"
                    : "Sorry, I cannot answer right now. Please try again later.";
        }
    }

    

    private String callGoogleGemini(String query, boolean isBangla, String geminiKey) throws IOException {
        String fullSystemPrompt = systemPrompt;
        if (isBangla)
            fullSystemPrompt += " Answer in Bangla.";

        String fullPrompt = fullSystemPrompt + "\n\nUser Question: " + query;

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="
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

    
}
