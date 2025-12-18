package com.arpon007.agro.controller;

import com.arpon007.agro.model.ChatMessage;
import com.arpon007.agro.repository.ChatRepository;
import com.arpon007.agro.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final ChatRepository chatRepository;
    private final JwtUtil jwtUtil;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(ChatRepository chatRepository, JwtUtil jwtUtil, SimpMessagingTemplate messagingTemplate) {
        this.chatRepository = chatRepository;
        this.jwtUtil = jwtUtil;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Get all chats for current user
     */
    @GetMapping("/chats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMyChats(HttpServletRequest request) {
        Long userId = extractUserId(request);
        return ResponseEntity.ok(chatRepository.findChatsByUserId(userId));
    }

    /**
     * Get messages for a specific chat
     */
    @GetMapping("/chats/{chatId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatMessage>> getChatMessages(
            @PathVariable Long chatId,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        // Verify user is part of this chat
        if (!chatRepository.isUserInChat(chatId, userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(chatRepository.findMessagesByChatId(chatId));
    }

    /**
     * Send a message in a chat
     */
    @PostMapping("/chats/{chatId}/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable Long chatId,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        Long userId = extractUserId(request);

        // Verify user is part of this chat
        if (!chatRepository.isUserInChat(chatId, userId)) {
            return ResponseEntity.status(403).build();
        }

        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ChatMessage message = new ChatMessage();
        message.setChatId(chatId);
        message.setSenderId(userId);
        message.setContent(content);

        chatRepository.save(message);

        // Notify via WebSocket
        try {
            Long otherUserId = chatRepository.getOtherUserId(chatId, userId);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(otherUserId),
                    "/queue/messages",
                    message);
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("WebSocket notification failed: " + e.getMessage());
        }

        return ResponseEntity.ok(message);
    }

    /**
     * Start a new chat with a user
     */
    @PostMapping("/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> startChat(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        Long otherUserId = Long.parseLong(payload.get("userId").toString());

        if (userId.equals(otherUserId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot start chat with yourself"));
        }

        Long chatId = chatRepository.findOrCreateChat(userId, otherUserId);
        return ResponseEntity.ok(Map.of("chatId", chatId));
    }

    /**
     * Mark messages as read
     */
    @PutMapping("/chats/{chatId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long chatId,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (!chatRepository.isUserInChat(chatId, userId)) {
            return ResponseEntity.status(403).build();
        }
        chatRepository.markMessagesAsRead(chatId, userId);
        return ResponseEntity.ok().build();
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractClaim(token, claims -> {
            Object idObj = claims.get("userId");
            if (idObj instanceof Integer) {
                return ((Integer) idObj).longValue();
            } else if (idObj instanceof Long) {
                return (Long) idObj;
            } else {
                return Long.parseLong(String.valueOf(idObj));
            }
        });
    }
}
