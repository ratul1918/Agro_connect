package com.arpon007.agro.model;

import java.sql.Timestamp;
import java.util.List;

public class Cart {
    private Long id;
    private Long customerId;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // Extra field for fetching
    private List<CartItem> items;

    public Cart() {
    }

    public Cart(Long id, Long customerId, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }
}
