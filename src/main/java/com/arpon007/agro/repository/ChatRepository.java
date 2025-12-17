package com.arpon007.agro.repository;

import com.arpon007.agro.model.ChatMessage;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ChatRepository {

    private final JdbcTemplate jdbcTemplate;

    public ChatRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(ChatMessage message) {
        String sql = "INSERT INTO chat_messages (chat_id, sender_id, content) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, message.getChatId(), message.getSenderId(), message.getContent());
    }
}
