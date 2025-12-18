package com.arpon007.agro.controller;

import com.arpon007.agro.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final JdbcTemplate jdbcTemplate;
    private final JwtUtil jwtUtil;

    public NotificationController(JdbcTemplate jdbcTemplate, JwtUtil jwtUtil) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Get all notifications for current user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMyNotifications(HttpServletRequest request) {
        Long userId = extractUserId(request);

        String sql = """
                    SELECT id, user_id, message_bn, type, is_read, created_at
                    FROM notifications
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT 50
                """;

        List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUnreadCount(HttpServletRequest request) {
        Long userId = extractUserId(request);

        String sql = "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = false";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);

        return ResponseEntity.ok(Map.of("count", count != null ? count : 0));
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        Long userId = extractUserId(request);

        String sql = "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?";
        jdbcTemplate.update(sql, id, userId);

        return ResponseEntity.ok().build();
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        Long userId = extractUserId(request);

        String sql = "UPDATE notifications SET is_read = true WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);

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
