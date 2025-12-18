package com.arpon007.agro.repository;

import com.arpon007.agro.model.ChatMessage;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class ChatRepository {

    private final JdbcTemplate jdbcTemplate;

    public ChatRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(ChatMessage message) {
        String sql = "INSERT INTO chat_messages (chat_id, sender_id, content) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, message.getChatId(), message.getSenderId(), message.getContent());

        // Update last_message in chats table
        String updateChatSql = "UPDATE chats SET last_message = ?, last_updated = NOW() WHERE id = ?";
        String truncatedMsg = message.getContent().length() > 100 ? message.getContent().substring(0, 100)
                : message.getContent();
        jdbcTemplate.update(updateChatSql, truncatedMsg, message.getChatId());
    }

    /**
     * Find or create a chat between two users
     */
    public Long findOrCreateChat(Long user1Id, Long user2Id) {
        String findSql = "SELECT id FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?) LIMIT 1";
        List<Long> chatIds = jdbcTemplate.queryForList(findSql, Long.class, user1Id, user2Id, user2Id, user1Id);

        if (!chatIds.isEmpty()) {
            return chatIds.get(0);
        }

        String createSql = "INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)";
        jdbcTemplate.update(createSql, user1Id, user2Id);

        return jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    /**
     * Find all chats for a user with contact info
     */
    public List<Map<String, Object>> findChatsByUserId(Long userId) {
        String sql = "SELECT c.id as chatId, " +
                "CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as contactId, " +
                "CASE WHEN c.user1_id = ? THEN u2.full_name ELSE u1.full_name END as contactName, " +
                "c.last_message as lastMessage, " +
                "c.last_updated as lastUpdated, " +
                "(SELECT COUNT(*) FROM chat_messages cm WHERE cm.chat_id = c.id AND cm.sender_id != ? AND cm.is_read = FALSE) as unreadCount "
                +
                "FROM chats c " +
                "JOIN users u1 ON c.user1_id = u1.id " +
                "JOIN users u2 ON c.user2_id = u2.id " +
                "WHERE c.user1_id = ? OR c.user2_id = ? " +
                "ORDER BY c.last_updated DESC";
        return jdbcTemplate.queryForList(sql, userId, userId, userId, userId, userId);
    }

    /**
     * Find all messages in a chat
     */
    public List<ChatMessage> findMessagesByChatId(Long chatId) {
        String sql = "SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY sent_at ASC";
        return jdbcTemplate.query(sql, new ChatMessageRowMapper(), chatId);
    }

    /**
     * Check if user is part of a chat
     */
    public boolean isUserInChat(Long chatId, Long userId) {
        String sql = "SELECT COUNT(*) FROM chats WHERE id = ? AND (user1_id = ? OR user2_id = ?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, chatId, userId, userId);
        return count != null && count > 0;
    }

    /**
     * Get the other user in a chat
     */
    public Long getOtherUserId(Long chatId, Long userId) {
        String sql = "SELECT CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END FROM chats WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, userId, chatId);
    }

    /**
     * Mark messages as read
     */
    public void markMessagesAsRead(Long chatId, Long userId) {
        String sql = "UPDATE chat_messages SET is_read = TRUE WHERE chat_id = ? AND sender_id != ?";
        jdbcTemplate.update(sql, chatId, userId);
    }

    /**
     * Send a bid notification message (for new bids from buyer to farmer)
     */
    public void sendBidMessage(Long buyerId, Long farmerId, String cropTitle, String amount, String quantity) {
        Long chatId = findOrCreateChat(buyerId, farmerId);

        String bidMessage = String.format(
                "🔔 নতুন বিড!\n\n" +
                        "ফসল: %s\n" +
                        "পরিমাণ: %s কেজি\n" +
                        "প্রস্তাবিত মূল্য: ৳%s/কেজি\n\n" +
                        "আপনার ফসলে একটি নতুন বিড এসেছে।",
                cropTitle, quantity, amount);

        ChatMessage message = new ChatMessage();
        message.setChatId(chatId);
        message.setSenderId(buyerId);
        message.setContent(bidMessage);
        save(message);
    }

    /**
     * Send a direct message between two users
     */
    public void sendDirectMessage(Long senderId, Long receiverId, String content) {
        Long chatId = findOrCreateChat(senderId, receiverId);

        ChatMessage message = new ChatMessage();
        message.setChatId(chatId);
        message.setSenderId(senderId);
        message.setContent(content);
        save(message);
    }

    /**
     * Delete a chat and all its messages
     */
    public void deleteChat(Long chatId) {
        // Messages will be cascade deleted due to FK constraint
        String sql = "DELETE FROM chats WHERE id = ?";
        jdbcTemplate.update(sql, chatId);
    }

    private static class ChatMessageRowMapper implements RowMapper<ChatMessage> {
        @Override
        public ChatMessage mapRow(ResultSet rs, int rowNum) throws SQLException {
            ChatMessage msg = new ChatMessage();
            msg.setId(rs.getLong("id"));
            msg.setChatId(rs.getLong("chat_id"));
            msg.setSenderId(rs.getLong("sender_id"));
            msg.setContent(rs.getString("content"));
            msg.setIsRead(rs.getBoolean("is_read"));
            msg.setSentAt(rs.getTimestamp("sent_at"));
            return msg;
        }
    }
}
