package com.arpon007.agro.repository;

import com.arpon007.agro.model.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;

@Repository
public class OrderRepository {

    private final JdbcTemplate jdbcTemplate;

    public OrderRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Long createOrder(Order order) {
        String sql = "INSERT INTO orders (buyer_id, farmer_id, crop_id, total_amount, advance_amount, due_amount, customer_mobile, customer_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, order.getBuyerId());
            ps.setLong(2, order.getFarmerId());
            ps.setLong(3, order.getCropId());
            ps.setBigDecimal(4, order.getTotalAmount());
            ps.setBigDecimal(5, order.getAdvanceAmount());
            ps.setBigDecimal(6, order.getDueAmount());
            ps.setString(7, order.getCustomerMobile());
            ps.setString(8, order.getCustomerAddress());
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    public void updateStatus(Long orderId, String status) {
        String sql = "UPDATE orders SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, orderId);
    }

    public void updateDeliveryStatus(Long orderId, String deliveryStatus) {
        String sql = "UPDATE orders SET delivery_status = ? WHERE id = ?";
        jdbcTemplate.update(sql, deliveryStatus, orderId);
    }

    public java.util.Optional<Order> findById(Long id) {
        String sql = "SELECT * FROM orders WHERE id = ?";
        try {
            Order order = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Order o = new Order();
                o.setId(rs.getLong("id"));
                o.setBuyerId(rs.getLong("buyer_id"));
                o.setFarmerId(rs.getLong("farmer_id"));
                o.setCropId(rs.getLong("crop_id"));
                o.setTotalAmount(rs.getBigDecimal("total_amount"));
                o.setAdvanceAmount(rs.getBigDecimal("advance_amount"));
                o.setDueAmount(rs.getBigDecimal("due_amount"));
                try {
                    o.setStatus(com.arpon007.agro.model.Order.OrderStatus.valueOf(rs.getString("status")));
                } catch (Exception e) {
                    o.setStatus(com.arpon007.agro.model.Order.OrderStatus.PENDING);
                }
                try {
                    String deliveryStatus = rs.getString("delivery_status");
                    if (deliveryStatus != null) {
                        o.setDeliveryStatus(com.arpon007.agro.model.Order.DeliveryStatus.valueOf(deliveryStatus));
                    }
                } catch (Exception e) {
                    o.setDeliveryStatus(com.arpon007.agro.model.Order.DeliveryStatus.PENDING);
                }
                o.setCustomerMobile(rs.getString("customer_mobile"));
                o.setCustomerAddress(rs.getString("customer_address"));
                o.setCreatedAt(rs.getTimestamp("created_at"));
                return o;
            }, id);
            return java.util.Optional.ofNullable(order);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return java.util.Optional.empty();
        }
    }

    /**
     * Get orders by customer ID
     */
    public java.util.List<Order> findByCustomerId(Long customerId) {
        String sql = "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Order o = new Order();
            o.setId(rs.getLong("id"));
            o.setBuyerId(rs.getLong("buyer_id"));
            o.setFarmerId(rs.getLong("farmer_id"));
            o.setCropId(rs.getLong("crop_id"));
            o.setTotalAmount(rs.getBigDecimal("total_amount"));
            o.setAdvanceAmount(rs.getBigDecimal("advance_amount"));
            o.setDueAmount(rs.getBigDecimal("due_amount"));
            try {
                o.setStatus(com.arpon007.agro.model.Order.OrderStatus.valueOf(rs.getString("status")));
            } catch (Exception e) {
                o.setStatus(com.arpon007.agro.model.Order.OrderStatus.PENDING);
            }
            try {
                String deliveryStatus = rs.getString("delivery_status");
                if (deliveryStatus != null) {
                    o.setDeliveryStatus(com.arpon007.agro.model.Order.DeliveryStatus.valueOf(deliveryStatus));
                }
            } catch (Exception e) {
                o.setDeliveryStatus(com.arpon007.agro.model.Order.DeliveryStatus.PENDING);
            }
            o.setCustomerMobile(rs.getString("customer_mobile"));
            o.setCustomerAddress(rs.getString("customer_address"));
            o.setCreatedAt(rs.getTimestamp("created_at"));
            return o;
        }, customerId);
    }

    /**
     * Record platform income when order is completed
     */
    @Transactional
    public void recordPlatformIncome(Long orderId, java.math.BigDecimal amount, java.math.BigDecimal feePercentage) {
        String sql = "INSERT INTO platform_income (order_id, amount, fee_percentage) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, orderId, amount, feePercentage);
    }

    /**
     * Get total platform income
     */
    public java.math.BigDecimal getTotalIncome() {
        String sql = "SELECT COALESCE(SUM(amount), 0) FROM platform_income";
        return jdbcTemplate.queryForObject(sql, java.math.BigDecimal.class);
    }

    /**
     * Check if income already recorded for order
     */
    public boolean isIncomeRecorded(Long orderId) {
        String sql = "SELECT COUNT(*) FROM platform_income WHERE order_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, orderId);
        return count != null && count > 0;
    }
}
