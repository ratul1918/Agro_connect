package com.arpon007.agro.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class CartItem {
    private Long id;
    private Long cartId;
    private Long cropId;
    private BigDecimal quantity;
    private BigDecimal priceAtAddition;
    private Timestamp createdAt;

    // Extra fields for fetching
    private String cropTitle;
    private String cropImage;
    private BigDecimal currentPrice;

    public CartItem() {
    }

    public CartItem(Long id, Long cartId, Long cropId, BigDecimal quantity, BigDecimal priceAtAddition,
            Timestamp createdAt) {
        this.id = id;
        this.cartId = cartId;
        this.cropId = cropId;
        this.quantity = quantity;
        this.priceAtAddition = priceAtAddition;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtAddition() {
        return priceAtAddition;
    }

    public void setPriceAtAddition(BigDecimal priceAtAddition) {
        this.priceAtAddition = priceAtAddition;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getCropTitle() {
        return cropTitle;
    }

    public void setCropTitle(String cropTitle) {
        this.cropTitle = cropTitle;
    }

    public String getCropImage() {
        return cropImage;
    }

    public void setCropImage(String cropImage) {
        this.cropImage = cropImage;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }
}
