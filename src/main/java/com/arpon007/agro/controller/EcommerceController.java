package com.arpon007.agro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * General Customer E-commerce Controller
 * For users buying small quantities (100g - 40kg)
 */
@RestController
@RequestMapping("/api/ecommerce")
public class EcommerceController {

    private final JdbcTemplate jdbcTemplate;

    public EcommerceController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Get all products available for general customers
     * These are crops marked for retail (smaller quantities)
     */
    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getRetailProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        StringBuilder sql = new StringBuilder("""
                SELECT c.*,
                       ct.name_en as crop_type_en, ct.name_bn as crop_type_bn,
                       u.full_name as farmer_name, u.district as farmer_location,
                       (SELECT image_url FROM crop_images ci WHERE ci.crop_id = c.id LIMIT 1) as image_url
                FROM crops c
                JOIN crop_type ct ON c.crop_type_id = ct.id
                JOIN users u ON c.farmer_id = u.id
                WHERE c.is_sold = false AND c.quantity <= 50
                """);

        if (category != null && !category.isBlank()) {
            sql.append(" AND ct.name_en = '").append(category).append("'");
        }
        if (search != null && !search.isBlank()) {
            sql.append(" AND (c.title LIKE '%").append(search).append("%' OR ct.name_bn LIKE '%").append(search)
                    .append("%')");
        }

        sql.append(" ORDER BY c.created_at DESC LIMIT ").append(size).append(" OFFSET ").append(page * size);

        return ResponseEntity.ok(jdbcTemplate.queryForList(sql.toString()));
    }

    /**
     * Get product details
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> getProductDetails(@PathVariable Long id) {
        String sql = """
                SELECT c.*,
                       ct.name_en as crop_type_en, ct.name_bn as crop_type_bn,
                       u.id as farmer_id, u.full_name as farmer_name, u.district as farmer_location,
                       (SELECT AVG(r.rating) FROM reviews r WHERE r.target_user_id = u.id) as farmer_rating
                FROM crops c
                JOIN crop_type ct ON c.crop_type_id = ct.id
                JOIN users u ON c.farmer_id = u.id
                WHERE c.id = ?
                """;

        Map<String, Object> product = jdbcTemplate.queryForMap(sql, id);

        // Get images
        String imagesSql = "SELECT image_url FROM crop_images WHERE crop_id = ?";
        List<String> images = jdbcTemplate.queryForList(imagesSql, String.class, id);
        product.put("images", images);

        // Get reviews for farmer
        String reviewsSql = """
                SELECT r.*, u.full_name as reviewer_name
                FROM reviews r
                JOIN users u ON r.reviewer_id = u.id
                WHERE r.target_user_id = ?
                ORDER BY r.created_at DESC LIMIT 5
                """;
        List<Map<String, Object>> reviews = jdbcTemplate.queryForList(reviewsSql, product.get("farmer_id"));
        product.put("farmerReviews", reviews);

        return ResponseEntity.ok(product);
    }

    /**
     * Get categories for filter
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        String sql = "SELECT id, name_en, name_bn FROM crop_type ORDER BY name_en";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    /**
     * Get export products (for international buyers)
     */
    @GetMapping("/exports")
    public ResponseEntity<List<Map<String, Object>>> getExportProducts() {
        String sql = """
                SELECT ea.*, u.full_name as farmer_name, u.district
                FROM export_applications ea
                JOIN users u ON ea.farmer_id = u.id
                WHERE ea.status = 'APPROVED'
                ORDER BY ea.created_at DESC
                """;
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }
}
