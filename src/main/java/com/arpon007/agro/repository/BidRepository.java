package com.arpon007.agro.repository;

import com.arpon007.agro.model.Bid;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class BidRepository {

    private final JdbcTemplate jdbcTemplate;

    public BidRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Place a new bid
     */
    public void placeBid(Bid bid) {
        String sql = "INSERT INTO bids (crop_id, buyer_id, amount, quantity, last_action_by, status) VALUES (?, ?, ?, ?, 'BUYER', 'PENDING')";
        jdbcTemplate.update(sql, bid.getCropId(), bid.getBuyerId(), bid.getAmount(), bid.getQuantity());
    }

    /**
     * Find bid by ID
     */
    public Optional<Bid> findById(Long bidId) {
        String sql = """
                SELECT b.*,
                       buyer.full_name as buyer_name,
                       c.title as crop_title,
                       c.farmer_id,
                       c.min_price as crop_min_price,
                       c.unit,
                       farmer.full_name as farmer_name
                FROM bids b
                JOIN users buyer ON b.buyer_id = buyer.id
                JOIN crops c ON b.crop_id = c.id
                JOIN users farmer ON c.farmer_id = farmer.id
                WHERE b.id = ? AND b.status != 'DELETED'
                """;
        List<Bid> bids = jdbcTemplate.query(sql, new BidRowMapper(), bidId);
        return bids.isEmpty() ? Optional.empty() : Optional.of(bids.get(0));
    }

    /**
     * Find all bids for a crop
     */
    public List<Bid> findByCropId(Long cropId) {
        String sql = """
                SELECT b.*,
                       buyer.full_name as buyer_name,
                       c.title as crop_title,
                       c.farmer_id,
                       c.min_price as crop_min_price,
                       c.unit,
                       farmer.full_name as farmer_name
                FROM bids b
                JOIN users buyer ON b.buyer_id = buyer.id
                JOIN crops c ON b.crop_id = c.id
                JOIN users farmer ON c.farmer_id = farmer.id
                WHERE b.crop_id = ? AND b.status != 'DELETED'
                ORDER BY b.updated_at DESC
                """;
        return jdbcTemplate.query(sql, new BidRowMapper(), cropId);
    }

    /**
     * Find all bids by buyer
     */
    public List<Bid> findByBuyerId(Long buyerId) {
        String sql = """
                SELECT b.*,
                       buyer.full_name as buyer_name,
                       c.title as crop_title,
                       c.farmer_id,
                       c.min_price as crop_min_price,
                       c.unit,
                       farmer.full_name as farmer_name
                FROM bids b
                JOIN users buyer ON b.buyer_id = buyer.id
                JOIN crops c ON b.crop_id = c.id
                JOIN users farmer ON c.farmer_id = farmer.id
                WHERE b.buyer_id = ? AND b.status != 'DELETED'
                ORDER BY b.updated_at DESC
                """;
        return jdbcTemplate.query(sql, new BidRowMapper(), buyerId);
    }

    /**
     * Find all bids for farmer's products
     */
    public List<Bid> findByFarmerId(Long farmerId) {
        String sql = """
                SELECT b.*,
                       buyer.full_name as buyer_name,
                       c.title as crop_title,
                       c.farmer_id,
                       c.min_price as crop_min_price,
                       c.unit,
                       farmer.full_name as farmer_name
                FROM bids b
                JOIN users buyer ON b.buyer_id = buyer.id
                JOIN crops c ON b.crop_id = c.id
                JOIN users farmer ON c.farmer_id = farmer.id
                WHERE c.farmer_id = ? AND b.status != 'DELETED'
                ORDER BY b.updated_at DESC
                """;
        return jdbcTemplate.query(sql, new BidRowMapper(), farmerId);
    }

    /**
     * Update bid status
     */
    public void updateStatus(Long bidId, String status) {
        String sql = "UPDATE bids SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, bidId);
    }

    /**
     * Farmer counter-offer
     */
    public void farmerCounterOffer(Long bidId, BigDecimal counterPrice) {
        String sql = "UPDATE bids SET farmer_counter_price = ?, last_action_by = 'FARMER', status = 'COUNTER_OFFER' WHERE id = ?";
        jdbcTemplate.update(sql, counterPrice, bidId);
    }

    /**
     * Buyer updates their bid amount (responding to counter)
     */
    public void buyerUpdateBid(Long bidId, BigDecimal newAmount) {
        String sql = "UPDATE bids SET amount = ?, last_action_by = 'BUYER', status = 'PENDING' WHERE id = ?";
        jdbcTemplate.update(sql, newAmount, bidId);
    }

    /**
     * Accept bid
     */
    public void acceptBid(Long bidId) {
        String sql = "UPDATE bids SET status = 'ACCEPTED' WHERE id = ?";
        jdbcTemplate.update(sql, bidId);
    }

    /**
     * Reject bid
     */
    public void rejectBid(Long bidId) {
        String sql = "UPDATE bids SET status = 'REJECTED' WHERE id = ?";
        jdbcTemplate.update(sql, bidId);
    }

    /**
     * Delete (soft delete) bid
     */
    public void deleteBid(Long bidId) {
        String sql = "UPDATE bids SET status = 'DELETED' WHERE id = ?";
        jdbcTemplate.update(sql, bidId);
    }

    /**
     * Get all bids (for admin)
     */
    public List<Bid> findAll() {
        String sql = """
                SELECT b.*,
                       buyer.full_name as buyer_name,
                       c.title as crop_title,
                       c.farmer_id,
                       c.min_price as crop_min_price,
                       c.unit,
                       farmer.full_name as farmer_name
                FROM bids b
                JOIN users buyer ON b.buyer_id = buyer.id
                JOIN crops c ON b.crop_id = c.id
                JOIN users farmer ON c.farmer_id = farmer.id
                WHERE b.status != 'DELETED'
                ORDER BY b.updated_at DESC
                """;
        return jdbcTemplate.query(sql, new BidRowMapper());
    }

    private static class BidRowMapper implements RowMapper<Bid> {
        @Override
        public Bid mapRow(ResultSet rs, int rowNum) throws SQLException {
            Bid bid = new Bid();
            bid.setId(rs.getLong("id"));
            bid.setCropId(rs.getLong("crop_id"));
            bid.setBuyerId(rs.getLong("buyer_id"));
            bid.setAmount(rs.getBigDecimal("amount"));
            bid.setQuantity(rs.getBigDecimal("quantity"));
            bid.setFarmerCounterPrice(rs.getBigDecimal("farmer_counter_price"));
            bid.setLastActionBy(rs.getString("last_action_by"));
            bid.setBidTime(rs.getTimestamp("bid_time"));
            bid.setUpdatedAt(rs.getTimestamp("updated_at"));
            bid.setStatus(rs.getString("status"));
            bid.setBuyerName(rs.getString("buyer_name"));
            bid.setCropTitle(rs.getString("crop_title"));
            bid.setFarmerId(rs.getLong("farmer_id"));
            bid.setCropMinPrice(rs.getBigDecimal("crop_min_price"));
            bid.setUnit(rs.getString("unit"));
            bid.setFarmerName(rs.getString("farmer_name"));
            return bid;
        }
    }
}
