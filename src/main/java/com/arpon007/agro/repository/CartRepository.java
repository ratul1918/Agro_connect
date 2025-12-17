package com.arpon007.agro.repository;

import com.arpon007.agro.model.Cart;
import com.arpon007.agro.model.CartItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

@Repository
public class CartRepository {

    private final JdbcTemplate jdbcTemplate;

    public CartRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Get or create cart for customer
    public Cart getOrCreateCart(Long customerId) {
        String selectSql = "SELECT * FROM cart WHERE customer_id = ?";
        List<Cart> carts = jdbcTemplate.query(selectSql, this::mapRowToCart, customerId);

        if (carts.isEmpty()) {
            // Create new cart
            String insertSql = "INSERT INTO cart (customer_id) VALUES (?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, customerId);
                return ps;
            }, keyHolder);

            Long cartId = keyHolder.getKey().longValue();
            return getCartById(cartId);
        }

        return carts.get(0);
    }

    // Get cart by ID
    public Cart getCartById(Long cartId) {
        String sql = "SELECT * FROM cart WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, this::mapRowToCart, cartId);
    }

    // Get cart with items
    public Cart getCartWithItems(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        List<CartItem> items = getCartItems(cart.getId());
        cart.setItems(items);
        return cart;
    }

    // Get all cart items
    public List<CartItem> getCartItems(Long cartId) {
        String sql = "SELECT ci.*, c.title as crop_title, c.retail_price as current_price, " +
                "(SELECT image_url FROM crop_images WHERE crop_id = c.id LIMIT 1) as crop_image " +
                "FROM cart_items ci " +
                "JOIN crops c ON ci.crop_id = c.id " +
                "WHERE ci.cart_id = ?";
        return jdbcTemplate.query(sql, this::mapRowToCartItem, cartId);
    }

    // Add item to cart
    public CartItem addItemToCart(Long cartId, Long cropId, BigDecimal quantity, BigDecimal price) {
        // Check if item already exists
        String checkSql = "SELECT * FROM cart_items WHERE cart_id = ? AND crop_id = ?";
        List<CartItem> existing = jdbcTemplate.query(checkSql, this::mapRowToCartItem, cartId, cropId);

        if (!existing.isEmpty()) {
            // Update quantity
            CartItem item = existing.get(0);
            BigDecimal newQuantity = item.getQuantity().add(quantity);
            updateCartItemQuantity(item.getId(), newQuantity);
            return getCartItemById(item.getId());
        } else {
            // Insert new item
            String insertSql = "INSERT INTO cart_items (cart_id, crop_id, quantity, price_at_addition) VALUES (?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, cartId);
                ps.setLong(2, cropId);
                ps.setBigDecimal(3, quantity);
                ps.setBigDecimal(4, price);
                return ps;
            }, keyHolder);

            Long itemId = keyHolder.getKey().longValue();
            return getCartItemById(itemId);
        }
    }

    // Get cart item by ID
    public CartItem getCartItemById(Long itemId) {
        String sql = "SELECT ci.*, c.title as crop_title, c.retail_price as current_price, " +
                "(SELECT image_url FROM crop_images WHERE crop_id = c.id LIMIT 1) as crop_image " +
                "FROM cart_items ci " +
                "JOIN crops c ON ci.crop_id = c.id " +
                "WHERE ci.id = ?";
        return jdbcTemplate.queryForObject(sql, this::mapRowToCartItem, itemId);
    }

    // Update cart item quantity
    public void updateCartItemQuantity(Long itemId, BigDecimal quantity) {
        String sql = "UPDATE cart_items SET quantity = ? WHERE id = ?";
        jdbcTemplate.update(sql, quantity, itemId);
    }

    // Remove item from cart
    public void removeCartItem(Long itemId) {
        String sql = "DELETE FROM cart_items WHERE id = ?";
        jdbcTemplate.update(sql, itemId);
    }

    // Clear all items from cart
    public void clearCart(Long cartId) {
        String sql = "DELETE FROM cart_items WHERE cart_id = ?";
        jdbcTemplate.update(sql, cartId);
    }

    // Delete cart
    public void deleteCart(Long cartId) {
        clearCart(cartId);
        String sql = "DELETE FROM cart WHERE id = ?";
        jdbcTemplate.update(sql, cartId);
    }

    private Cart mapRowToCart(ResultSet rs, int rowNum) throws SQLException {
        Cart cart = new Cart();
        cart.setId(rs.getLong("id"));
        cart.setCustomerId(rs.getLong("customer_id"));
        cart.setCreatedAt(rs.getTimestamp("created_at"));
        cart.setUpdatedAt(rs.getTimestamp("updated_at"));
        return cart;
    }

    private CartItem mapRowToCartItem(ResultSet rs, int rowNum) throws SQLException {
        CartItem item = new CartItem();
        item.setId(rs.getLong("id"));
        item.setCartId(rs.getLong("cart_id"));
        item.setCropId(rs.getLong("crop_id"));
        item.setQuantity(rs.getBigDecimal("quantity"));
        item.setPriceAtAddition(rs.getBigDecimal("price_at_addition"));
        item.setCreatedAt(rs.getTimestamp("created_at"));

        // Extra fields if available
        try {
            item.setCropTitle(rs.getString("crop_title"));
            item.setCropImage(rs.getString("crop_image"));
            item.setCurrentPrice(rs.getBigDecimal("current_price"));
        } catch (SQLException e) {
            // Fields not present in query
        }

        return item;
    }
}
