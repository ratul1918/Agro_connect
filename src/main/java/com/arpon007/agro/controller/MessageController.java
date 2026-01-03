package com.arpon007.agro.controller;

import com.arpon007.agro.model.Message;
import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.MessageRepository;
import com.arpon007.agro.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageController(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    // Get all messages for current user (inbox)
    @GetMapping("/inbox")
    public ResponseEntity<List<Message>> getInboxMessages(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(messageRepository.findInboxMessages(user.getId()));
    }

    // Get sent messages for current user
    @GetMapping("/sent")
    public ResponseEntity<List<Message>> getSentMessages(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(messageRepository.findSentMessages(user.getId()));
    }

    // Get conversation between two users
    @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable Long userId, Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(messageRepository.findConversation(currentUser.getId(), otherUser.getId()));
    }

    // Send a message - also creates chat for integrated messaging
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> messageData,
            Authentication authentication) {
        User sender = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long receiverId = ((Number) messageData.get("receiverId")).longValue();
        String content = (String) messageData.get("content");
        String messageType = (String) messageData.getOrDefault("messageType", "NORMAL");

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSenderId(sender.getId());
        message.setReceiverId(receiver.getId());
        message.setContent(content);
        message.setMessageType(messageType);

        Message saved = messageRepository.save(message);

        // Also create or update chat for integrated messaging system
        try {
            // First check if chat exists
            java.util.List<java.util.Map<String, Object>> chats = messageRepository.findChat(sender.getId(),
                    receiverId);
            Long chatId;
            if (chats.isEmpty()) {
                chatId = messageRepository.createChat(sender.getId(), receiverId);
            } else {
                chatId = ((Number) chats.get(0).get("id")).longValue();
            }
            // Add message to chat
            messageRepository.addChatMessage(chatId, sender.getId(), content, messageType);
            // Update last message
            String preview = content.length() > 100 ? content.substring(0, 100) : content;
            messageRepository.updateChatLastMessage(chatId, preview);
        } catch (Exception e) {
            // Silently fail - the message table still has the message
            System.err.println("Warning: Failed to create chat: " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    // Mark message as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Only receiver can mark as read
        if (!message.getReceiverId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        messageRepository.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Message marked as read"));
    }

    // Mark entire conversation as read
    @PutMapping("/conversation/{userId}/read")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long userId, Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        messageRepository.markConversationAsRead(currentUser.getId(), userId);
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }

    // Get unread messages count
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        int count = messageRepository.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Delete message
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Only sender or receiver can delete
        if (!message.getSenderId().equals(user.getId()) && !message.getReceiverId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        messageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Message deleted"));
    }

    // Get agronomists for messaging (for farmers)
    @GetMapping("/agronomists")
    public ResponseEntity<List<User>> getAgronomists() {
        List<User> agronomists = userRepository.findByRole("ROLE_AGRONOMIST");
        return ResponseEntity.ok(agronomists);
    }

    // Get farmers for messaging (for agronomists)
    @GetMapping("/farmers")
    public ResponseEntity<List<User>> getFarmers() {
        List<User> farmers = userRepository.findByRole("ROLE_FARMER");
        return ResponseEntity.ok(farmers);
    }
}