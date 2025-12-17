package com.arpon007.agro.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Bid {
    private Long id;
    private Long cropId;
    private Long buyerId;
    private BigDecimal amount; // Buyer's proposed price per unit
    private BigDecimal quantity; // Quantity for this bid
    private BigDecimal farmerCounterPrice; // Farmer's counter-offer price
    private String lastActionBy; // BUYER or FARMER
    private Timestamp bidTime;
    private Timestamp updatedAt;
    private String status; // PENDING, COUNTER_OFFER, ACCEPTED, REJECTED, DELETED

    // Extra fields for display
    private String buyerName;
    private String cropTitle;
    private String farmerName;
    private Long farmerId;
    private String unit;
    private BigDecimal cropMinPrice; // Original listed price

    public Bid() {
    }

    public Bid(Long id, Long cropId, Long buyerId, BigDecimal amount, BigDecimal quantity,
            BigDecimal farmerCounterPrice, String lastActionBy, Timestamp bidTime,
            Timestamp updatedAt, String status) {
        this.id = id;
        this.cropId = cropId;
        this.buyerId = buyerId;
        this.amount = amount;
        this.quantity = quantity;
        this.farmerCounterPrice = farmerCounterPrice;
        this.lastActionBy = lastActionBy;
        this.bidTime = bidTime;
        this.updatedAt = updatedAt;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getFarmerCounterPrice() {
        return farmerCounterPrice;
    }

    public void setFarmerCounterPrice(BigDecimal farmerCounterPrice) {
        this.farmerCounterPrice = farmerCounterPrice;
    }

    public String getLastActionBy() {
        return lastActionBy;
    }

    public void setLastActionBy(String lastActionBy) {
        this.lastActionBy = lastActionBy;
    }

    public Timestamp getBidTime() {
        return bidTime;
    }

    public void setBidTime(Timestamp bidTime) {
        this.bidTime = bidTime;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getCropTitle() {
        return cropTitle;
    }

    public void setCropTitle(String cropTitle) {
        this.cropTitle = cropTitle;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getCropMinPrice() {
        return cropMinPrice;
    }

    public void setCropMinPrice(BigDecimal cropMinPrice) {
        this.cropMinPrice = cropMinPrice;
    }
}
