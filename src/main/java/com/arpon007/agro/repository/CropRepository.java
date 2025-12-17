package com.arpon007.agro.repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.arpon007.agro.model.Crop;

@Repository
public class CropRepository {

    private final JdbcTemplate jdbcTemplate;

    public CropRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Crop save(Crop crop) {
        String sql = "INSERT INTO crops (farmer_id, title, description, crop_type_id, quantity, unit, min_price, wholesale_price, min_wholesale_qty, retail_price, min_retail_qty, max_retail_qty, profit_margin_percent, fixed_cost_per_unit, location, marketplace_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, crop.getFarmerId());
            ps.setString(2, crop.getTitle());
            ps.setString(3, crop.getDescription());
            ps.setInt(4, crop.getCropTypeId());
            ps.setBigDecimal(5, crop.getQuantity());
            ps.setString(6, crop.getUnit());
            ps.setBigDecimal(7, crop.getMinPrice());
            // Wholesale price defaults to minPrice + 5% if not set
            BigDecimal basePrice = crop.getMinPrice() != null ? crop.getMinPrice() : BigDecimal.ZERO;
            ps.setBigDecimal(8, crop.getWholesalePrice() != null ? crop.getWholesalePrice()
                    : basePrice.multiply(new java.math.BigDecimal("1.05")));
            ps.setBigDecimal(9,
                    crop.getMinWholesaleQty() != null ? crop.getMinWholesaleQty() : new java.math.BigDecimal("80"));
            ps.setBigDecimal(10, crop.getRetailPrice()); // Can be null, will be calculated
            ps.setBigDecimal(11,
                    crop.getMinRetailQty() != null ? crop.getMinRetailQty() : new java.math.BigDecimal("0.1"));
            ps.setBigDecimal(12,
                    crop.getMaxRetailQty() != null ? crop.getMaxRetailQty() : new java.math.BigDecimal("10"));
            ps.setBigDecimal(13, crop.getProfitMarginPercent() != null ? crop.getProfitMarginPercent()
                    : new java.math.BigDecimal("25"));
            ps.setBigDecimal(14,
                    crop.getFixedCostPerUnit() != null ? crop.getFixedCostPerUnit() : new java.math.BigDecimal("5"));
            ps.setString(15, crop.getLocation());
            ps.setString(16, crop.getMarketplaceType() != null ? crop.getMarketplaceType().name() : "BOTH");
            return ps;
        }, keyHolder);

        long newId = keyHolder.getKey().longValue();
        crop.setId(newId);

        // Save images
        if (crop.getImages() != null) {
            String imgSql = "INSERT INTO crop_images (crop_id, image_url) VALUES (?, ?)";
            for (String url : crop.getImages()) {
                jdbcTemplate.update(imgSql, newId, url);
            }
        }

        return crop;
    }

    /**
     * Update an existing crop
     */
    public Crop update(Crop crop) {
        String sql = "UPDATE crops SET farmer_id = ?, title = ?, description = ?, crop_type_id = ?, " +
                "quantity = ?, unit = ?, min_price = ?, wholesale_price = ?, min_wholesale_qty = ?, " +
                "retail_price = ?, min_retail_qty = ?, max_retail_qty = ?, profit_margin_percent = ?, " +
                "fixed_cost_per_unit = ?, location = ?, marketplace_type = ? WHERE id = ?";

        jdbcTemplate.update(sql,
                crop.getFarmerId(),
                crop.getTitle(),
                crop.getDescription(),
                crop.getCropTypeId(),
                crop.getQuantity(),
                crop.getUnit(),
                crop.getMinPrice(),
                crop.getWholesalePrice(),
                crop.getMinWholesaleQty(),
                crop.getRetailPrice(),
                crop.getMinRetailQty(),
                crop.getMaxRetailQty(),
                crop.getProfitMarginPercent(),
                crop.getFixedCostPerUnit(),
                crop.getLocation(),
                crop.getMarketplaceType() != null ? crop.getMarketplaceType().name() : "BOTH",
                crop.getId());

        // Update images if provided
        if (crop.getImages() != null && !crop.getImages().isEmpty()) {
            // Delete old images
            jdbcTemplate.update("DELETE FROM crop_images WHERE crop_id = ?", crop.getId());

            // Insert new images
            String imgSql = "INSERT INTO crop_images (crop_id, image_url) VALUES (?, ?)";
            for (String url : crop.getImages()) {
                jdbcTemplate.update(imgSql, crop.getId(), url);
            }
        }

        return crop;
    }

    public List<Crop> findAll(boolean isBangla) {
        // Fetch crop type name based on language
        String typeCol = isBangla ? "ct.name_bn" : "ct.name_en";
        String sql = "SELECT c.*, u.full_name as farmer_name, " + typeCol + " as type_name " +
                "FROM crops c " +
                "JOIN users u ON c.farmer_id = u.id " +
                "JOIN crop_type ct ON c.crop_type_id = ct.id " +
                "WHERE c.is_sold = FALSE " +
                "ORDER BY c.created_at DESC";

        List<Crop> crops = jdbcTemplate.query(sql, new CropRowMapper());

        // Populate images for each crop to support UI previews
        String imgSql = "SELECT image_url FROM crop_images WHERE crop_id = ?";
        for (Crop crop : crops) {
            List<String> images = jdbcTemplate.queryForList(imgSql, String.class, crop.getId());
            crop.setImages(images);
        }
        return crops;
    }

    public Optional<Crop> findById(Long id, boolean isBangla) {
        String typeCol = isBangla ? "ct.name_bn" : "ct.name_en";
        String sql = "SELECT c.*, u.full_name as farmer_name, " + typeCol + " as type_name " +
                "FROM crops c " +
                "JOIN users u ON c.farmer_id = u.id " +
                "JOIN crop_type ct ON c.crop_type_id = ct.id " +
                "WHERE c.id = ?";

        try {
            Crop crop = jdbcTemplate.queryForObject(sql, new CropRowMapper(), id);
            // Fetch images
            String imgSql = "SELECT image_url FROM crop_images WHERE crop_id = ?";
            List<String> images = jdbcTemplate.queryForList(imgSql, String.class, id);
            crop.setImages(images);
            return Optional.of(crop);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private static class CropRowMapper implements RowMapper<Crop> {
        @Override
        public Crop mapRow(ResultSet rs, int rowNum) throws SQLException {
            Crop crop = new Crop();
            crop.setId(rs.getLong("id"));
            crop.setFarmerId(rs.getLong("farmer_id"));
            crop.setTitle(rs.getString("title"));
            crop.setDescription(rs.getString("description"));
            crop.setCropTypeId(rs.getInt("crop_type_id"));
            crop.setQuantity(rs.getBigDecimal("quantity"));
            crop.setUnit(rs.getString("unit"));
            crop.setMinPrice(rs.getBigDecimal("min_price"));
            crop.setWholesalePrice(rs.getBigDecimal("wholesale_price"));
            crop.setMinWholesaleQty(rs.getBigDecimal("min_wholesale_qty"));
            crop.setRetailPrice(rs.getBigDecimal("retail_price"));
            crop.setMinRetailQty(rs.getBigDecimal("min_retail_qty"));
            crop.setMaxRetailQty(rs.getBigDecimal("max_retail_qty"));
            crop.setProfitMarginPercent(rs.getBigDecimal("profit_margin_percent"));
            crop.setFixedCostPerUnit(rs.getBigDecimal("fixed_cost_per_unit"));
            crop.setLocation(rs.getString("location"));
            crop.setIsSold(rs.getBoolean("is_sold"));
            crop.setCreatedAt(rs.getTimestamp("created_at"));
            crop.setFarmerName(rs.getString("farmer_name"));
            crop.setCropTypeName(rs.getString("type_name"));

            // Parse marketplace type
            try {
                String marketplaceType = rs.getString("marketplace_type");
                if (marketplaceType != null) {
                    crop.setMarketplaceType(Crop.MarketplaceType.valueOf(marketplaceType));
                }
            } catch (Exception e) {
                crop.setMarketplaceType(Crop.MarketplaceType.BOTH);
            }

            return crop;
        }
    }

    /**
     * Update quantity settings for a crop (Admin only)
     */
    public void updateQuantitySettings(Long cropId, java.math.BigDecimal minWholesaleQty,
            java.math.BigDecimal minRetailQty, java.math.BigDecimal maxRetailQty) {
        String sql = "UPDATE crops SET min_wholesale_qty = ?, min_retail_qty = ?, max_retail_qty = ? WHERE id = ?";
        jdbcTemplate.update(sql, minWholesaleQty, minRetailQty, maxRetailQty, cropId);
    }

    /**
     * Update pricing settings for a crop (Admin only)
     */
    public void updatePricingSettings(Long cropId, java.math.BigDecimal wholesalePrice,
            java.math.BigDecimal retailPrice, java.math.BigDecimal profitMarginPercent,
            java.math.BigDecimal fixedCostPerUnit) {
        String sql = "UPDATE crops SET wholesale_price = ?, retail_price = ?, profit_margin_percent = ?, fixed_cost_per_unit = ? WHERE id = ?";
        jdbcTemplate.update(sql, wholesalePrice, retailPrice, profitMarginPercent, fixedCostPerUnit, cropId);
    }

    /**
     * Get all retail crops (with images)
     */
    public List<Crop> findAllRetail() {
        String sql = "SELECT c.*, u.full_name as farmer_name, ct.name_en as type_name " +
                "FROM crops c " +
                "JOIN users u ON c.farmer_id = u.id " +
                "JOIN crop_type ct ON c.crop_type_id = ct.id " +
                "WHERE c.is_sold = FALSE " +
                "AND c.marketplace_type = 'RETAIL' " +
                "ORDER BY c.created_at DESC";

        List<Crop> crops = jdbcTemplate.query(sql, new CropRowMapper());

        // Populate images for each crop
        String imgSql = "SELECT image_url FROM crop_images WHERE crop_id = ?";
        for (Crop crop : crops) {
            List<String> images = jdbcTemplate.queryForList(imgSql, String.class, crop.getId());
            crop.setImages(images);
        }
        return crops;
    }

    public Optional<Crop> findById(Long id) {
        return findById(id, false);
    }

    /**
     * Get all crops for admin (includes all fields, no language filter)
     */
    public List<Crop> findAllForAdmin() {
        String sql = "SELECT c.*, u.full_name as farmer_name, ct.name_en as type_name " +
                "FROM crops c " +
                "JOIN users u ON c.farmer_id = u.id " +
                "JOIN crop_type ct ON c.crop_type_id = ct.id " +
                "ORDER BY c.created_at DESC";
        return jdbcTemplate.query(sql, new CropRowMapper());
    }

    public void updateStock(Long id, java.math.BigDecimal newQuantity) {
        String sql = "UPDATE crops SET quantity = ? WHERE id = ?";
        jdbcTemplate.update(sql, newQuantity, id);
    }

    public List<java.util.Map<String, Object>> getAllCropTypes() {
        return jdbcTemplate.queryForList("SELECT * FROM crop_type");
    }

    /**
     * Get crops by marketplace type (B2B or RETAIL only - no BOTH)
     */
    public List<Crop> findByMarketplaceType(String marketplaceType) {
        String sql = "SELECT c.*, u.full_name as farmer_name, ct.name_en as type_name " +
                "FROM crops c " +
                "JOIN users u ON c.farmer_id = u.id " +
                "JOIN crop_type ct ON c.crop_type_id = ct.id " +
                "WHERE c.is_sold = FALSE AND c.marketplace_type = ? " +
                "ORDER BY c.created_at DESC";

        List<Crop> crops = jdbcTemplate.query(sql, new CropRowMapper(), marketplaceType);

        // Populate images for each crop
        String imgSql = "SELECT image_url FROM crop_images WHERE crop_id = ?";
        for (Crop crop : crops) {
            List<String> images = jdbcTemplate.queryForList(imgSql, String.class, crop.getId());
            crop.setImages(images);
        }
        return crops;
    }

    /**
     * Update marketplace type for a crop
     */
    public void updateMarketplaceType(Long cropId, String marketplaceType) {
        String sql = "UPDATE crops SET marketplace_type = ? WHERE id = ?";
        jdbcTemplate.update(sql, marketplaceType, cropId);
    }

    /**
     * Mark crop as sold out (stock out)
     */
    public void markAsSoldOut(Long cropId) {
        String sql = "UPDATE crops SET is_sold = TRUE WHERE id = ?";
        jdbcTemplate.update(sql, cropId);
    }

    /**
     * Mark crop as available (back in stock)
     */
    public void markAsAvailable(Long cropId) {
        String sql = "UPDATE crops SET is_sold = FALSE WHERE id = ?";
        jdbcTemplate.update(sql, cropId);
    }
}
