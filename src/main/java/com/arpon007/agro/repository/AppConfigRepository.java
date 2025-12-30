package com.arpon007.agro.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AppConfigRepository {

    private final JdbcTemplate jdbcTemplate;

    public AppConfigRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String getValue(String key, String defaultValue) {
        try {
            String sql = "SELECT config_value FROM app_configs WHERE config_key = ?";
            return jdbcTemplate.queryForObject(sql, String.class, key);
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public void setValue(String key, String value) {
        // Check if the key exists first
        String checkSql = "SELECT COUNT(*) FROM app_configs WHERE config_key = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, key);
        
        if (count != null && count > 0) {
            // Update existing record
            String updateSql = "UPDATE app_configs SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?";
            jdbcTemplate.update(updateSql, value, key);
        } else {
            // Insert new record
            String insertSql = "INSERT INTO app_configs (config_key, config_value) VALUES (?, ?)";
            jdbcTemplate.update(insertSql, key, value);
        }
    }

    public Map<String, String> getAllConfigs() {
        String sql = "SELECT config_key, config_value FROM app_configs";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        Map<String, String> configs = new HashMap<>();
        for (Map<String, Object> row : rows) {
            configs.put((String) row.get("config_key"), (String) row.get("config_value"));
        }
        return configs;
    }
}
