package com.arpon007.agro.controller;

import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

/**
 * Enhanced Messenger Controller with Image/Voice/Video support
 */
@RestController
@RequestMapping("/api/messenger")
public class MessengerController {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;

    public MessengerController(JdbcTemplate jdbcTemplate, UserRepository userRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
    }

    /**
     * Get or create a chat between two users
     */
    @PostMapping("/chats")
    public ResponseEntity<Map<String, Object>> getOrCreateChat(@RequestBody Map<String, Long> request,
            Authentication auth) {
        User currentUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long otherUserId = request.get("userId");

        // Check if chat exists
        String checkSql = """
                SELECT id FROM chats
                WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
                """;
        List<Map<String, Object>> existing = jdbcTemplate.queryForList(checkSql,
                currentUser.getId(), otherUserId, otherUserId, currentUser.getId());

        Long chatId;
        if (!existing.isEmpty()) {
            chatId = ((Number) existing.get(0).get("id")).longValue();
        } else {
            // Create new chat
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        "INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, currentUser.getId());
                ps.setLong(2, otherUserId);
                return ps;
            }, keyHolder);
            chatId = keyHolder.getKey().longValue();
        }

        return ResponseEntity.ok(Map.of("chatId", chatId));
    }

    /**
     * Get all chats for current user
     */
    @GetMapping("/chats")
    public ResponseEntity<List<Map<String, Object>>> getMyChats(Authentication auth) {
        User currentUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String sql = """
                SELECT c.id as chat_id,
                       CASE WHEN c.user1_id = ? THEN u2.id ELSE u1.id END as other_user_id,
                       CASE WHEN c.user1_id = ? THEN u2.full_name ELSE u1.full_name END as other_user_name,
                       CASE WHEN c.user1_id = ? THEN u2.profile_image_url ELSE u1.profile_image_url END as other_user_image,
                       c.last_message, c.last_updated,
                       (SELECT COUNT(*) FROM chat_messages cm WHERE cm.chat_id = c.id AND cm.sender_id != ? AND cm.is_read = false) as unread_count
                FROM chats c
                JOIN users u1 ON c.user1_id = u1.id
                JOIN users u2 ON c.user2_id = u2.id
                WHERE c.user1_id = ? OR c.user2_id = ?
                ORDER BY c.last_updated DESC
                """;

        List<Map<String, Object>> chats = jdbcTemplate.queryForList(sql,
                currentUser.getId(), currentUser.getId(), currentUser.getId(),
                currentUser.getId(), currentUser.getId(), currentUser.getId());

        return ResponseEntity.ok(chats);
    }

    /**
     * Get messages for a chat
     */
    @GetMapping("/chats/{chatId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getChatMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset) {

        String sql = """
                SELECT m.*, u.full_name as sender_name, u.profile_image_url as sender_image
                FROM chat_messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.chat_id = ? AND m.is_deleted = false
                ORDER BY m.sent_at DESC
                LIMIT ? OFFSET ?
                """;

        List<Map<String, Object>> messages = jdbcTemplate.queryForList(sql, chatId, limit, offset);
        return ResponseEntity.ok(messages);
    }

    /**
     * Send message (text, image, voice, video)
     */
    @PostMapping("/chats/{chatId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable Long chatId,
            @RequestBody Map<String, String> request,
            Authentication auth) {

        User sender = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String content = request.getOrDefault("content", "");
        String messageType = request.getOrDefault("messageType", "TEXT");
        String mediaUrl = request.get("mediaUrl");

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO chat_messages (chat_id, sender_id, content, message_type, media_url) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, chatId);
            ps.setLong(2, sender.getId());
            ps.setString(3, content);
            ps.setString(4, messageType);
            ps.setString(5, mediaUrl);
            return ps;
        }, keyHolder);

        // Update chat's last message
        String preview = messageType.equals("TEXT") ? content : "[" + messageType + "]";
        jdbcTemplate.update("UPDATE chats SET last_message = ?, last_updated = NOW() WHERE id = ?",
                preview.length() > 100 ? preview.substring(0, 100) : preview, chatId);

        // Create notification for receiver
        String receiverSql = """
                SELECT CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END as receiver_id FROM chats WHERE id = ?
                """;
        Long receiverId = jdbcTemplate.queryForObject(receiverSql, Long.class, sender.getId(), chatId);

        if (receiverId != null) {
            jdbcTemplate.update(
                    "INSERT INTO notifications (user_id, message_bn, type) VALUES (?, ?, 'MESSAGE')",
                    receiverId, sender.getFullName() + " sent you a message / আপনাকে একটি বার্তা পাঠিয়েছে");
        }

        return ResponseEntity.ok(Map.of(
                "messageId", keyHolder.getKey().longValue(),
                "message", "Message sent"));
    }

    /**
     * Mark messages as read
     */
    @PostMapping("/chats/{chatId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long chatId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        jdbcTemplate.update(
                "UPDATE chat_messages SET is_read = true WHERE chat_id = ? AND sender_id != ?",
                chatId, user.getId());

        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    /**
     * Delete/Hide a message
     */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only sender can delete
        int updated = jdbcTemplate.update(
                "UPDATE chat_messages SET is_deleted = true WHERE id = ? AND sender_id = ?",
                messageId, user.getId());

        if (updated == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete message"));
        }

        return ResponseEntity.ok(Map.of("message", "Message deleted"));
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = false",
                Integer.class, user.getId());

        return ResponseEntity.ok(Map.of("unreadCount", count != null ? count : 0));
    }

    /**
     * Get notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String sql = """
                SELECT * FROM notifications
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 50
                """;

        return ResponseEntity.ok(jdbcTemplate.queryForList(sql, user.getId()));
    }

    /**
     * Mark notifications as read
     */
    @PostMapping("/notifications/read")
    public ResponseEntity<?> markNotificationsRead(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        jdbcTemplate.update("UPDATE notifications SET is_read = true WHERE user_id = ?", user.getId());

        return ResponseEntity.ok(Map.of("message", "Notifications marked as read"));
    }
}
