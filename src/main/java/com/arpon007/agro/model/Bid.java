package com.arpon007.agro.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Bid {
    private Long id;
    private Long cropId;
    private Long buyerId;
    private BigDecimal amount;
    private Timestamp bidTime;
    private String status; // PENDING, ACCEPTED, REJECTED
    private String buyerName;

    public Bid() {
    }

    public Bid(Long id, Long cropId, Long buyerId, BigDecimal amount, Timestamp bidTime, String status,
            String buyerName) {
        this.id = id;
        this.cropId = cropId;
        this.buyerId = buyerId;
        this.amount = amount;
        this.bidTime = bidTime;
        this.status = status;
        this.buyerName = buyerName;
    }

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

    public Timestamp getBidTime() {
        return bidTime;
    }

    public void setBidTime(Timestamp bidTime) {
        this.bidTime = bidTime;
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
}
