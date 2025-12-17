package com.arpon007.agro.repository;

import com.arpon007.agro.model.MarketPrice;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class MarketPriceRepository {

    private final JdbcTemplate jdbcTemplate;

    public MarketPriceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<MarketPrice> findByDistrict(String district, boolean isBangla) {
        String typeCol = isBangla ? "ct.name_bn" : "ct.name_en";
        String sql = "SELECT mp.*, " + typeCol + " as type_name " +
                "FROM market_price mp " +
                "JOIN crop_type ct ON mp.crop_type_id = ct.id " +
                "WHERE mp.district = ? " +
                "ORDER BY mp.price_date DESC";

        return jdbcTemplate.query(sql, new MarketPriceRowMapper(), district);
    }

    public List<MarketPrice> findAll(boolean isBangla) {
        String typeCol = isBangla ? "ct.name_bn" : "ct.name_en";
        String sql = "SELECT mp.*, " + typeCol + " as type_name " +
                "FROM market_price mp " +
                "JOIN crop_type ct ON mp.crop_type_id = ct.id " +
                "ORDER BY mp.price_date DESC";

        return jdbcTemplate.query(sql, new MarketPriceRowMapper());
    }

    public void save(MarketPrice price) {
        String sql = "INSERT INTO market_price (crop_type_id, district, price, price_date) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, price.getCropTypeId(), price.getDistrict(), price.getPrice(), price.getPriceDate());
    }

    private static class MarketPriceRowMapper implements RowMapper<MarketPrice> {
        @Override
        public MarketPrice mapRow(ResultSet rs, int rowNum) throws SQLException {
            MarketPrice mp = new MarketPrice();
            mp.setId(rs.getLong("id"));
            mp.setCropTypeId(rs.getInt("crop_type_id"));
            mp.setDistrict(rs.getString("district"));
            mp.setPrice(rs.getBigDecimal("price"));
            mp.setPriceDate(rs.getDate("price_date"));
            mp.setCropTypeName(rs.getString("type_name"));
            return mp;
        }
    }
}
