package com.arpon007.agro.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Repository
public class FeatureRepository {

    private final JdbcTemplate jdbcTemplate;

    public FeatureRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Export
    public void applyForExport(Long farmerId, String cropDetails, BigDecimal quantity, String destination) {
        String sql = "INSERT INTO export_applications (farmer_id, crop_details, quantity, destination_country) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, farmerId, cropDetails, quantity, destination);
    }

    public List<Map<String, Object>> getExportApplications() {
        return jdbcTemplate.queryForList("SELECT * FROM export_applications ORDER BY created_at DESC");
    }

    // Subsidy
    public void applyForSubsidy(Long farmerId, Integer schemeId) {
        String sql = "INSERT INTO farmer_subsidy_applications (farmer_id, scheme_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, farmerId, schemeId);
    }

    public List<Map<String, Object>> getSubsidySchemes() {
        return jdbcTemplate.queryForList("SELECT * FROM subsidy_schemes");
    }

    // Review
    public void addReview(Long reviewerId, Long targetUserId, Integer rating, String comment) {
        String sql = "INSERT INTO reviews (reviewer_id, target_user_id, rating, comment) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, reviewerId, targetUserId, rating, comment);
    }

    public void deleteReview(Long id) {
        String sql = "DELETE FROM reviews WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void deleteCrop(Long id) {
        String sql = "DELETE FROM crops WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // Blog Management
    public List<Map<String, Object>> getAllBlogsForAdmin() {
        String sql = """
                SELECT b.id, b.title, b.content, b.created_at as createdAt,
                       u.full_name as authorName, b.status
                FROM blogs b
                LEFT JOIN users u ON b.author_id = u.id
                ORDER BY b.created_at DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            // Table might not exist
            return java.util.Collections.emptyList();
        }
    }

    public void deleteBlog(Long id) {
        String sql = "DELETE FROM blogs WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // ==================== EXPORT MANAGEMENT ====================

    public List<Map<String, Object>> getAllExportApplicationsForAdmin() {
        String sql = """
                SELECT e.id, e.farmer_id as farmerId, e.crop_details as cropDetails,
                       e.quantity, e.destination_country as destinationCountry,
                       e.status, e.admin_notes as adminNotes, e.created_at as createdAt,
                       u.full_name as farmerName, u.email as farmerEmail
                FROM export_applications e
                LEFT JOIN users u ON e.farmer_id = u.id
                ORDER BY e.created_at DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getExportApplicationsByFarmer(Long farmerId) {
        String sql = """
                SELECT id, crop_details as cropDetails, quantity,
                       destination_country as destinationCountry, status,
                       admin_notes as adminNotes, created_at as createdAt
                FROM export_applications
                WHERE farmer_id = ?
                ORDER BY created_at DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql, farmerId);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public void updateExportStatus(Long id, String status, String notes) {
        String sql = "UPDATE export_applications SET status = ?, admin_notes = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, notes, id);
    }

    // ==================== ORDERS MANAGEMENT ====================

    public List<Map<String, Object>> getAllOrdersForAdmin() {
        String sql = """
                SELECT o.id, o.buyer_id as buyerId, o.farmer_id as farmerId,
                       o.crop_id as cropId, o.total_amount as totalAmount,
                       o.advance_amount as advanceAmount, o.due_amount as dueAmount,
                       o.status, o.created_at as createdAt,
                       o.customer_mobile as customerMobile,
                       o.customer_address as customerAddress,
                       o.delivery_status as deliveryStatus,
                       buyer.full_name as buyerName, buyer.email as buyerEmail,
                       farmer.full_name as farmerName, farmer.email as farmerEmail,
                       c.title as cropTitle
                FROM orders o
                LEFT JOIN users buyer ON o.buyer_id = buyer.id
                LEFT JOIN users farmer ON o.farmer_id = farmer.id
                LEFT JOIN crops c ON o.crop_id = c.id
                ORDER BY o.created_at DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getOrdersByBuyer(Long buyerId) {
        String sql = """
                SELECT o.id, o.farmer_id as farmerId, o.crop_id as cropId,
                       o.total_amount as totalAmount, o.advance_amount as advanceAmount,
                       o.due_amount as dueAmount, o.status, o.created_at as createdAt,
                       farmer.full_name as farmerName,
                       c.title as cropTitle
                FROM orders o
                LEFT JOIN users farmer ON o.farmer_id = farmer.id
                LEFT JOIN crops c ON o.crop_id = c.id
                WHERE o.buyer_id = ?
                ORDER BY o.created_at DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql, buyerId);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getOrdersByFarmer(Long farmerId) {
        String sql = """
                SELECT o.id, o.buyer_id as buyerId, o.crop_id as cropId,
                       o.total_amount as totalAmount, o.advance_amount as advanceAmount,
                       o.due_amount as dueAmount, o.status, o.created_at as createdAt,
                       buyer.full_name as buyerName,
                       c.title as cropTitle
                FROM orders o
                LEFT JOIN users buyer ON o.buyer_id = buyer.id
                LEFT JOIN crops c ON o.crop_id = c.id
                WHERE o.farmer_id = ?
                ORDER BY o.created_at DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql, farmerId);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public void updateOrderStatus(Long id, String status) {
        String sql = "UPDATE orders SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, id);
    }

    public void deleteOrder(Long id) {
        String sql = "DELETE FROM orders WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // ==================== BIDS MANAGEMENT ====================

    public List<Map<String, Object>> getAllBidsForAdmin() {
        String sql = """
                SELECT b.id, b.crop_id as cropId, b.buyer_id as buyerId,
                       b.amount, b.bid_time as bidTime, b.status,
                       buyer.full_name as buyerName,
                       c.title as cropTitle, c.farmer_id as farmerId,
                       farmer.full_name as farmerName
                FROM bids b
                LEFT JOIN users buyer ON b.buyer_id = buyer.id
                LEFT JOIN crops c ON b.crop_id = c.id
                LEFT JOIN users farmer ON c.farmer_id = farmer.id
                ORDER BY b.bid_time DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getBidsByBuyer(Long buyerId) {
        String sql = """
                SELECT b.id, b.crop_id as cropId, b.amount, b.bid_time as bidTime, b.status,
                       c.title as cropTitle, farmer.full_name as farmerName
                FROM bids b
                LEFT JOIN crops c ON b.crop_id = c.id
                LEFT JOIN users farmer ON c.farmer_id = farmer.id
                WHERE b.buyer_id = ?
                ORDER BY b.bid_time DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql, buyerId);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getBidsForFarmer(Long farmerId) {
        String sql = """
                SELECT b.id, b.crop_id as cropId, b.buyer_id as buyerId,
                       b.amount, b.bid_time as bidTime, b.status,
                       buyer.full_name as buyerName, buyer.email as buyerEmail,
                       c.title as cropTitle
                FROM bids b
                LEFT JOIN crops c ON b.crop_id = c.id
                LEFT JOIN users buyer ON b.buyer_id = buyer.id
                WHERE c.farmer_id = ?
                ORDER BY b.bid_time DESC
                """;
        try {
            return jdbcTemplate.queryForList(sql, farmerId);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public void updateBidStatus(Long id, String status) {
        String sql = "UPDATE bids SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, id);
    }
}
