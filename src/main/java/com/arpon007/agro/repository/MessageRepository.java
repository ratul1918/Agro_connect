package com.arpon007.agro.repository;

import com.arpon007.agro.model.Message;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class MessageRepository {

    private final JdbcTemplate jdbcTemplate;

    public MessageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Message> messageRowMapper = (rs, rowNum) -> {
        Message message = new Message();
        message.setId(rs.getLong("id"));
        message.setSenderId(rs.getLong("sender_id"));
        message.setReceiverId(rs.getLong("receiver_id"));
        message.setContent(rs.getString("content"));
        message.setMessageType(rs.getString("message_type"));
        message.setRead(rs.getBoolean("is_read"));
        message.setCreatedAt(rs.getTimestamp("created_at"));
        message.setUpdatedAt(rs.getTimestamp("updated_at"));

        // Sender details
        try {
            message.setSenderName(rs.getString("sender_name"));
            message.setSenderEmail(rs.getString("sender_email"));
            message.setSenderRole(rs.getString("sender_role"));
        } catch (Exception ignored) {
        }

        // Receiver details
        try {
            message.setReceiverName(rs.getString("receiver_name"));
            message.setReceiverEmail(rs.getString("receiver_email"));
            message.setReceiverRole(rs.getString("receiver_role"));
        } catch (Exception ignored) {
        }

        return message;
    };

    public Message save(Message message) {
        String sql = "INSERT INTO messages (sender_id, receiver_id, content, message_type, is_read) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, message.getSenderId());
            ps.setLong(2, message.getReceiverId());
            ps.setString(3, message.getContent());
            ps.setString(4, message.getMessageType() != null ? message.getMessageType() : "NORMAL");
            ps.setBoolean(5, false); // New messages are unread
            return ps;
        }, keyHolder);
        message.setId(keyHolder.getKey().longValue());
        return message;
    }

    public List<Message> findConversation(Long userId1, Long userId2) {
        String sql = """
                SELECT m.*,
                       s.full_name as sender_name, s.email as sender_email,
                       r.full_name as receiver_name, r.email as receiver_email
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE (m.sender_id = ? AND m.receiver_id = ?)
                   OR (m.sender_id = ? AND m.receiver_id = ?)
                ORDER BY m.created_at ASC
                """;
        return jdbcTemplate.query(sql, messageRowMapper, userId1, userId2, userId2, userId1);
    }

    public List<Message> findInboxMessages(Long userId) {
        String sql = """
                SELECT m.*,
                       s.full_name as sender_name, s.email as sender_email,
                       r.full_name as receiver_name, r.email as receiver_email
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE m.receiver_id = ?
                ORDER BY m.created_at DESC
                """;
        return jdbcTemplate.query(sql, messageRowMapper, userId);
    }

    public List<Message> findSentMessages(Long userId) {
        String sql = """
                SELECT m.*,
                       s.full_name as sender_name, s.email as sender_email,
                       r.full_name as receiver_name, r.email as receiver_email
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE m.sender_id = ?
                ORDER BY m.created_at DESC
                """;
        return jdbcTemplate.query(sql, messageRowMapper, userId);
    }

    public List<Message> findUnreadMessages(Long userId) {
        String sql = """
                SELECT m.*,
                       s.full_name as sender_name, s.email as sender_email,
                       r.full_name as receiver_name, r.email as receiver_email
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE m.receiver_id = ? AND m.is_read = false
                ORDER BY m.created_at DESC
                """;
        return jdbcTemplate.query(sql, messageRowMapper, userId);
    }

    public Optional<Message> findById(Long id) {
        String sql = """
                SELECT m.*,
                       s.full_name as sender_name, s.email as sender_email,
                       r.full_name as receiver_name, r.email as receiver_email
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE m.id = ?
                """;
        return jdbcTemplate.query(sql, messageRowMapper, id).stream().findFirst();
    }

    public void markAsRead(Long messageId) {
        jdbcTemplate.update("UPDATE messages SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                messageId);
    }

    public void markConversationAsRead(Long userId1, Long userId2) {
        jdbcTemplate.update("""
                UPDATE messages
                SET is_read = true, updated_at = CURRENT_TIMESTAMP
                WHERE sender_id = ? AND receiver_id = ? AND is_read = false
                """, userId2, userId1);
    }

    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM messages WHERE id = ?", id);
    }

    public int getUnreadCount(Long userId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND is_read = false",
                Integer.class, userId);
        return count != null ? count : 0;
    }

    // Chat integration methods for MessengerController compatibility
    public java.util.List<java.util.Map<String, Object>> findChat(Long userId1, Long userId2) {
        String sql = """
                SELECT id FROM chats
                WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
                """;
        return jdbcTemplate.queryForList(sql, userId1, userId2, userId2, userId1);
    }

    public Long createChat(Long userId1, Long userId2) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId1);
            ps.setLong(2, userId2);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public void addChatMessage(Long chatId, Long senderId, String content, String messageType) {
        jdbcTemplate.update(
                "INSERT INTO chat_messages (chat_id, sender_id, content, message_type) VALUES (?, ?, ?, ?)",
                chatId, senderId, content, messageType);
    }

    public void updateChatLastMessage(Long chatId, String lastMessage) {
        jdbcTemplate.update(
                "UPDATE chats SET last_message = ?, last_updated = NOW() WHERE id = ?",
                lastMessage, chatId);
    }
}