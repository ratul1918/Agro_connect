package com.arpon007.agro.repository;

import com.arpon007.agro.model.Bid;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class BidRepository {

    private final JdbcTemplate jdbcTemplate;

    public BidRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void placeBid(Bid bid) {
        String sql = "INSERT INTO bids (crop_id, buyer_id, amount) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, bid.getCropId(), bid.getBuyerId(), bid.getAmount());
    }

    public List<Bid> findByCropId(Long cropId) {
        String sql = "SELECT b.*, u.full_name as buyer_name " +
                "FROM bids b JOIN users u ON b.buyer_id = u.id " +
                "WHERE b.crop_id = ? " +
                "ORDER BY b.amount DESC";
        return jdbcTemplate.query(sql, new BidRowMapper(), cropId);
    }

    public void updateStatus(Long bidId, String status) {
        String sql = "UPDATE bids SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, bidId);
    }

    private static class BidRowMapper implements RowMapper<Bid> {
        @Override
        public Bid mapRow(ResultSet rs, int rowNum) throws SQLException {
            Bid bid = new Bid();
            bid.setId(rs.getLong("id"));
            bid.setCropId(rs.getLong("crop_id"));
            bid.setBuyerId(rs.getLong("buyer_id"));
            bid.setAmount(rs.getBigDecimal("amount"));
            bid.setBidTime(rs.getTimestamp("bid_time"));
            bid.setStatus(rs.getString("status"));
            bid.setBuyerName(rs.getString("buyer_name"));
            return bid;
        }
    }
}
