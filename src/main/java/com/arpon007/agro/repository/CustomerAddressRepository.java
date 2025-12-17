package com.arpon007.agro.repository;

import com.arpon007.agro.model.CustomerAddress;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

@Repository
public class CustomerAddressRepository {

    private final JdbcTemplate jdbcTemplate;

    public CustomerAddressRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Get all addresses for a user
    public List<CustomerAddress> findByUserId(Long userId) {
        String sql = "SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToAddress, userId);
    }

    // Get address by ID
    public CustomerAddress findById(Long id) {
        String sql = "SELECT * FROM customer_addresses WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, this::mapRowToAddress, id);
    }

    // Get default address for user
    public CustomerAddress findDefaultByUserId(Long userId) {
        String sql = "SELECT * FROM customer_addresses WHERE user_id = ? AND is_default = true LIMIT 1";
        List<CustomerAddress> addresses = jdbcTemplate.query(sql, this::mapRowToAddress, userId);
        return addresses.isEmpty() ? null : addresses.get(0);
    }

    // Create new address
    public CustomerAddress save(CustomerAddress address) {
        // If this is being set as default, unset any existing defaults
        if (address.getIsDefault()) {
            unsetDefaultForUser(address.getUserId());
        }

        String sql = "INSERT INTO customer_addresses (user_id, address_line1, address_line2, city, district, " +
                "post_code, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, address.getUserId());
            ps.setString(2, address.getAddressLine1());
            ps.setString(3, address.getAddressLine2());
            ps.setString(4, address.getCity());
            ps.setString(5, address.getDistrict());
            ps.setString(6, address.getPostCode());
            ps.setString(7, address.getPhone());
            ps.setBoolean(8, address.getIsDefault() != null ? address.getIsDefault() : false);
            return ps;
        }, keyHolder);

        Long id = keyHolder.getKey().longValue();
        return findById(id);
    }

    // Update address
    public void update(CustomerAddress address) {
        // If this is being set as default, unset any existing defaults
        if (address.getIsDefault()) {
            unsetDefaultForUser(address.getUserId());
        }

        String sql = "UPDATE customer_addresses SET address_line1 = ?, address_line2 = ?, city = ?, " +
                "district = ?, post_code = ?, phone = ?, is_default = ? WHERE id = ?";

        jdbcTemplate.update(sql,
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getDistrict(),
                address.getPostCode(),
                address.getPhone(),
                address.getIsDefault(),
                address.getId());
    }

    // Set address as default
    public void setAsDefault(Long addressId, Long userId) {
        unsetDefaultForUser(userId);
        String sql = "UPDATE customer_addresses SET is_default = true WHERE id = ?";
        jdbcTemplate.update(sql, addressId);
    }

    // Unset default for user
    private void unsetDefaultForUser(Long userId) {
        String sql = "UPDATE customer_addresses SET is_default = false WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }

    // Delete address
    public void deleteById(Long id) {
        String sql = "DELETE FROM customer_addresses WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    private CustomerAddress mapRowToAddress(ResultSet rs, int rowNum) throws SQLException {
        CustomerAddress address = new CustomerAddress();
        address.setId(rs.getLong("id"));
        address.setUserId(rs.getLong("user_id"));
        address.setAddressLine1(rs.getString("address_line1"));
        address.setAddressLine2(rs.getString("address_line2"));
        address.setCity(rs.getString("city"));
        address.setDistrict(rs.getString("district"));
        address.setPostCode(rs.getString("post_code"));
        address.setPhone(rs.getString("phone"));
        address.setIsDefault(rs.getBoolean("is_default"));
        address.setCreatedAt(rs.getTimestamp("created_at"));
        address.setUpdatedAt(rs.getTimestamp("updated_at"));
        return address;
    }
}
