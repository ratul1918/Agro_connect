package com.arpon007.agro.repository;

import com.arpon007.agro.model.AIApiKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class AIApiKeyRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AIApiKeyRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<AIApiKey> rowMapper = (rs, rowNum) -> {
        AIApiKey key = new AIApiKey();
        key.setId(rs.getLong("id"));
        key.setProvider(rs.getString("provider"));
        key.setApiKeyEncrypted(rs.getString("api_key_encrypted"));
        key.setKeyType(AIApiKey.KeyType.valueOf(rs.getString("key_type")));
        key.setActive(rs.getBoolean("is_active"));
        
        Timestamp lastValidated = rs.getTimestamp("last_validated");
        if (lastValidated != null) {
            key.setLastValidated(lastValidated.toLocalDateTime());
        }
        
        key.setValidationStatus(AIApiKey.ValidationStatus.valueOf(rs.getString("validation_status")));
        
        Long createdBy = rs.getLong("created_by");
        if (!rs.wasNull()) {
            key.setCreatedBy(createdBy);
        }
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            key.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            key.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return key;
    };

    public List<AIApiKey> findAll() {
        String sql = "SELECT * FROM ai_api_keys ORDER BY provider";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public Optional<AIApiKey> findByProvider(String provider) {
        String sql = "SELECT * FROM ai_api_keys WHERE provider = ?";
        List<AIApiKey> keys = jdbcTemplate.query(sql, rowMapper, provider);
        return keys.isEmpty() ? Optional.empty() : Optional.of(keys.get(0));
    }

    public Optional<AIApiKey> findActiveByProvider(String provider) {
        String sql = "SELECT * FROM ai_api_keys WHERE provider = ? AND is_active = TRUE";
        List<AIApiKey> keys = jdbcTemplate.query(sql, rowMapper, provider);
        return keys.isEmpty() ? Optional.empty() : Optional.of(keys.get(0));
    }

    public AIApiKey save(AIApiKey apiKey) {
        if (apiKey.getId() == null) {
            return insert(apiKey);
        } else {
            return update(apiKey);
        }
    }

    private AIApiKey insert(AIApiKey apiKey) {
        String sql = "INSERT INTO ai_api_keys (provider, api_key_encrypted, key_type, is_active, validation_status, created_by) VALUES (?, ?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, apiKey.getProvider());
            ps.setString(2, apiKey.getApiKeyEncrypted());
            ps.setString(3, apiKey.getKeyType().name());
            ps.setBoolean(4, apiKey.isActive());
            ps.setString(5, apiKey.getValidationStatus().name());
            if (apiKey.getCreatedBy() != null) {
                ps.setLong(6, apiKey.getCreatedBy());
            } else {
                ps.setNull(6, java.sql.Types.BIGINT);
            }
            return ps;
        }, keyHolder);
        
        apiKey.setId(keyHolder.getKey().longValue());
        return apiKey;
    }

    private AIApiKey update(AIApiKey apiKey) {
        String sql = "UPDATE ai_api_keys SET api_key_encrypted = ?, key_type = ?, is_active = ?, validation_status = ?, last_validated = ? WHERE id = ?";
        
        jdbcTemplate.update(sql,
            apiKey.getApiKeyEncrypted(),
            apiKey.getKeyType().name(),
            apiKey.isActive(),
            apiKey.getValidationStatus().name(),
            apiKey.getLastValidated(),
            apiKey.getId()
        );
        
        return apiKey;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM ai_api_keys WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void updateValidationStatus(Long id, AIApiKey.ValidationStatus status) {
        String sql = "UPDATE ai_api_keys SET validation_status = ?, last_validated = ? WHERE id = ?";
        jdbcTemplate.update(sql, status.name(), LocalDateTime.now(), id);
    }

    public void toggleActiveStatus(Long id, boolean isActive) {
        String sql = "UPDATE ai_api_keys SET is_active = ? WHERE id = ?";
        jdbcTemplate.update(sql, isActive, id);
    }

    public boolean existsByProvider(String provider) {
        String sql = "SELECT COUNT(*) FROM ai_api_keys WHERE provider = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, provider);
        return count != null && count > 0;
    }
}