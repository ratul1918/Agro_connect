package com.arpon007.agro.repository;

import com.arpon007.agro.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, new UserRowMapper(), email);
            if (user != null) {
                user.setRoles(getUserRoles(user.getId()));
            }
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public User save(User user) {
        if (user.getId() != null && findById(user.getId()).isPresent()) {
            // Update existing user
            String sql = "UPDATE users SET full_name = ?, email = ?, password_hash = ?, phone = ?, country = ?, division = ?, district = ?, upazila = ?, thana = ?, post_code = ?, is_verified = ?, email_verified = ? WHERE id = ?";
            jdbcTemplate.update(sql, user.getFullName(), user.getEmail(), user.getPasswordHash(), user.getPhone(),
                    user.getCountry(), user.getDivision(), user.getDistrict(), user.getUpazila(), user.getThana(),
                    user.getPostCode(), user.isVerified(), user.isEmailVerified(), user.getId());
            return findById(user.getId()).orElseThrow();
        } else {
            // Insert new user
            String sql = "INSERT INTO users (full_name, email, password_hash, phone, country, division, district, upazila, thana, post_code, is_verified, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, user.getFullName(), user.getEmail(), user.getPasswordHash(), user.getPhone(),
                    user.getCountry(), user.getDivision(), user.getDistrict(), user.getUpazila(), user.getThana(),
                    user.getPostCode(), user.isVerified(), user.isEmailVerified());

            // Fetch ID back
            User savedUser = findByEmail(user.getEmail()).orElseThrow();
            return savedUser;
        }
    }

    public void addRole(Long userId, String roleName) {
        try {
            // Find Role ID
            String roleIdSql = "SELECT id FROM roles WHERE name = ?";
            Integer roleId = jdbcTemplate.queryForObject(roleIdSql, Integer.class, roleName);

            if (roleId != null) {
                // Check if role already assigned
                String checkSql = "SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role_id = ?";
                Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, roleId);

                if (count == null || count == 0) {
                    String sql = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
                    jdbcTemplate.update(sql, userId, roleId);
                }
            } else {
                System.err.println("Role not found in database: " + roleName);
            }
        } catch (Exception e) {
            System.err.println("Error adding role " + roleName + " to user " + userId + ": " + e.getMessage());
        }
    }

    public void updatePassword(Long userId, String newPasswordHash) {
        String sql = "UPDATE users SET password_hash = ? WHERE id = ?";
        jdbcTemplate.update(sql, newPasswordHash, userId);
    }

    public java.util.List<User> findAll() {
        String sql = "SELECT * FROM users";
        java.util.List<User> users = jdbcTemplate.query(sql, new UserRowMapper());

        if (users.isEmpty()) {
            return users;
        }

        // Fetch all roles at once to avoid N+1 problem
        String roleSql = "SELECT ur.user_id, r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id";
        java.util.Map<Long, java.util.Set<String>> rolesMap = new java.util.HashMap<>();

        jdbcTemplate.query(roleSql, (rs) -> {
            Long userId = rs.getLong("user_id");
            String roleName = rs.getString("name");
            rolesMap.computeIfAbsent(userId, k -> new java.util.HashSet<>()).add(roleName);
        });

        // Assign roles to users
        for (User user : users) {
            user.setRoles(rolesMap.getOrDefault(user.getId(), new java.util.HashSet<>()));
        }

        return users;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, new UserRowMapper(), id);
            if (user != null) {
                user.setRoles(getUserRoles(user.getId()));
            }
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public java.util.List<User> findByRole(String roleName) {
        String sql = """
                SELECT u.* FROM users u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN roles r ON ur.role_id = r.id
                WHERE r.name = ?
                """;
        return jdbcTemplate.query(sql, new UserRowMapper(), roleName);
    }

    private Set<String> getUserRoles(Long userId) {
        String sql = "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?";
        return new HashSet<>(jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("name"), userId));
    }

    private static class UserRowMapper implements RowMapper<User> {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setFullName(rs.getString("full_name"));
            user.setEmail(rs.getString("email"));
            user.setPasswordHash(rs.getString("password_hash"));
            user.setPhone(rs.getString("phone"));
            // Handle country column - may not exist in old databases
            try {
                user.setCountry(rs.getString("country"));
            } catch (SQLException e) {
                user.setCountry("Bangladesh"); // Default for old records
            }
            user.setDivision(rs.getString("division"));
            user.setDistrict(rs.getString("district"));
            user.setUpazila(rs.getString("upazila"));
            user.setThana(rs.getString("thana"));
            user.setPostCode(rs.getString("post_code"));
            user.setProfileImageUrl(rs.getString("profile_image_url"));
            user.setVerified(rs.getBoolean("is_verified"));
            user.setEmailVerified(rs.getBoolean("email_verified"));
            user.setCreatedAt(rs.getTimestamp("created_at"));
            user.setUpdatedAt(rs.getTimestamp("updated_at"));
            return user;
        }
    }
}
