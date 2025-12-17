package com.arpon007.agro.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Order {
    private Long id;
    private Long buyerId;
    private Long farmerId;
    private Long cropId;
    private BigDecimal totalAmount;
    private BigDecimal advanceAmount;
    private BigDecimal dueAmount;

    public enum OrderStatus {
        PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }

    private OrderStatus status; // PENDING, CONFIRMED, DELIVERED

    public enum DeliveryStatus {
        PENDING, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }

    private DeliveryStatus deliveryStatus;
    private String customerMobile;
    private String customerAddress;
    private Timestamp createdAt;

    public Order() {
    }

    public Order(Long id, Long buyerId, Long farmerId, Long cropId, BigDecimal totalAmount, BigDecimal advanceAmount,
            BigDecimal dueAmount, OrderStatus status, DeliveryStatus deliveryStatus, String customerMobile,
            String customerAddress, Timestamp createdAt) {
        this.id = id;
        this.buyerId = buyerId;
        this.farmerId = farmerId;
        this.cropId = cropId;
        this.totalAmount = totalAmount;
        this.advanceAmount = advanceAmount;
        this.dueAmount = dueAmount;
        this.status = status;
        this.deliveryStatus = deliveryStatus;
        this.customerMobile = customerMobile;
        this.customerAddress = customerAddress;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getAdvanceAmount() {
        return advanceAmount;
    }

    public void setAdvanceAmount(BigDecimal advanceAmount) {
        this.advanceAmount = advanceAmount;
    }

    public BigDecimal getDueAmount() {
        return dueAmount;
    }

    public void setDueAmount(BigDecimal dueAmount) {
        this.dueAmount = dueAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public DeliveryStatus getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(DeliveryStatus deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getCustomerMobile() {
        return customerMobile;
    }

    public void setCustomerMobile(String customerMobile) {
        this.customerMobile = customerMobile;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }
}
