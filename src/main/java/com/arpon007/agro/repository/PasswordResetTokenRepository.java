package com.arpon007.agro.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Date;
import java.util.Optional;

@Repository
public class PasswordResetTokenRepository {

    private final JdbcTemplate jdbcTemplate;

    public PasswordResetTokenRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createToken(Long userId, String token) {
        // Expiry 1 hour
        Timestamp expiryDate = new Timestamp(System.currentTimeMillis() + 3600000);
        String sql = "INSERT INTO password_reset_tokens (user_id, token, expiry_date) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, userId, token, expiryDate);
    }

    public Optional<Long> findUserIdByToken(String token) {
        String sql = "SELECT user_id FROM password_reset_tokens WHERE token = ? AND expiry_date > NOW()";
        try {
            Long userId = jdbcTemplate.queryForObject(sql, Long.class, token);
            return Optional.ofNullable(userId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void deleteByToken(String token) {
        String sql = "DELETE FROM password_reset_tokens WHERE token = ?";
        jdbcTemplate.update(sql, token);
    }

    public Optional<com.arpon007.agro.model.PasswordResetToken> findByToken(String token) {
        String sql = "SELECT * FROM password_reset_tokens WHERE token = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                com.arpon007.agro.model.PasswordResetToken prt = new com.arpon007.agro.model.PasswordResetToken();
                prt.setId(rs.getLong("id"));
                prt.setToken(rs.getString("token"));
                prt.setUserId(rs.getLong("user_id"));
                prt.setExpiryDate(rs.getTimestamp("expiry_date"));
                return prt;
            }, token));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
