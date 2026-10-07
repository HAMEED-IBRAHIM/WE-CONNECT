package com.alumni.platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.List;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    public String generateIcebreaker(String senderBio, String senderJob, String recipientBio, String recipientJob) {
        String prompt = String.format(
            "You are an expert AI networking assistant on an elite alumni platform. " +
            "Write a short, professional, and highly engaging connection request message (max 3 sentences) from User A to User B. " +
            "User A's profile: %s, %s. " +
            "User B's profile: %s, %s. " +
            "Do not include placeholders like [Your Name], just write the core message.", 
            senderJob, senderBio, recipientJob, recipientBio
        );

        return callGeminiApi(prompt);
    }

    private String callGeminiApi(String prompt) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String requestBody = "{\n" +
                    "  \"contents\": [{\n" +
                    "    \"parts\":[{\"text\": \"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}]\n" +
                    "  }]\n" +
                    "}";

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Hi, I'd love to connect and learn more about your work!";
        } catch (Exception e) {
            System.err.println("AI Generation failed: " + e.getMessage());
            return "I was impressed by your profile and would love to connect!"; // Fallback
        }
    }
}
