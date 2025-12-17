package com.arpon007.agro.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class Crop {
    private Long id;
    private Long farmerId;
    private String title;
    private String description;
    private Integer cropTypeId;
    private BigDecimal quantity;
    private String unit;

    // Wholesale pricing (for BUYER role - minimum 80kg)
    private BigDecimal minPrice; // Farmer's base price (wholesale)
    private BigDecimal wholesalePrice; // Price for buyers (slightly higher than minPrice)
    private BigDecimal minWholesaleQty; // Minimum quantity for wholesale (default 80kg)

    // Retail pricing (for GENERAL_CUSTOMER - small quantities like 1kg, 100gm)
    private BigDecimal retailPrice; // Consumer price (includes profit + fixed costs)
    private BigDecimal minRetailQty; // Minimum retail quantity (e.g., 0.1kg = 100gm)
    private BigDecimal maxRetailQty; // Maximum retail quantity (e.g., 10kg)

    // Profit margin configuration
    private BigDecimal profitMarginPercent; // e.g., 20 for 20%
    private BigDecimal fixedCostPerUnit; // Fixed cost per unit (transport, handling, etc.)

    private String location;
    private Boolean isSold;
    private Timestamp createdAt;

    // Extra fields for fetching
    private String farmerName;
    private String cropTypeName;
    private List<String> images;

    // Marketplace classification
    public enum MarketplaceType {
        B2B, RETAIL, BOTH
    }

    private MarketplaceType marketplaceType;

    public Crop() {
    }

    public Crop(Long id, Long farmerId, String title, String description, Integer cropTypeId, BigDecimal quantity,
            String unit, BigDecimal minPrice, BigDecimal wholesalePrice, BigDecimal minWholesaleQty,
            BigDecimal retailPrice, BigDecimal minRetailQty, BigDecimal maxRetailQty, BigDecimal profitMarginPercent,
            BigDecimal fixedCostPerUnit, String location, Boolean isSold, Timestamp createdAt, String farmerName,
            String cropTypeName, List<String> images) {
        this.id = id;
        this.farmerId = farmerId;
        this.title = title;
        this.description = description;
        this.cropTypeId = cropTypeId;
        this.quantity = quantity;
        this.unit = unit;
        this.minPrice = minPrice;
        this.wholesalePrice = wholesalePrice;
        this.minWholesaleQty = minWholesaleQty;
        this.retailPrice = retailPrice;
        this.minRetailQty = minRetailQty;
        this.maxRetailQty = maxRetailQty;
        this.profitMarginPercent = profitMarginPercent;
        this.fixedCostPerUnit = fixedCostPerUnit;
        this.location = location;
        this.isSold = isSold;
        this.createdAt = createdAt;
        this.farmerName = farmerName;
        this.cropTypeName = cropTypeName;
        this.images = images;
    }

    // Helper method - returns minPrice directly (no calculations)
    public BigDecimal getCalculatedRetailPrice() {
        // No calculations - return exact price set by farmer
        return minPrice;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCropTypeId() {
        return cropTypeId;
    }

    public void setCropTypeId(Integer cropTypeId) {
        this.cropTypeId = cropTypeId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }

    public BigDecimal getWholesalePrice() {
        return wholesalePrice;
    }

    public void setWholesalePrice(BigDecimal wholesalePrice) {
        this.wholesalePrice = wholesalePrice;
    }

    public BigDecimal getMinWholesaleQty() {
        return minWholesaleQty;
    }

    public void setMinWholesaleQty(BigDecimal minWholesaleQty) {
        this.minWholesaleQty = minWholesaleQty;
    }

    public BigDecimal getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(BigDecimal retailPrice) {
        this.retailPrice = retailPrice;
    }

    public BigDecimal getMinRetailQty() {
        return minRetailQty;
    }

    public void setMinRetailQty(BigDecimal minRetailQty) {
        this.minRetailQty = minRetailQty;
    }

    public BigDecimal getMaxRetailQty() {
        return maxRetailQty;
    }

    public void setMaxRetailQty(BigDecimal maxRetailQty) {
        this.maxRetailQty = maxRetailQty;
    }

    public BigDecimal getProfitMarginPercent() {
        return profitMarginPercent;
    }

    public void setProfitMarginPercent(BigDecimal profitMarginPercent) {
        this.profitMarginPercent = profitMarginPercent;
    }

    public BigDecimal getFixedCostPerUnit() {
        return fixedCostPerUnit;
    }

    public void setFixedCostPerUnit(BigDecimal fixedCostPerUnit) {
        this.fixedCostPerUnit = fixedCostPerUnit;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getIsSold() {
        return isSold;
    }

    public void setIsSold(Boolean isSold) {
        this.isSold = isSold;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getCropTypeName() {
        return cropTypeName;
    }

    public void setCropTypeName(String cropTypeName) {
        this.cropTypeName = cropTypeName;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public MarketplaceType getMarketplaceType() {
        return marketplaceType;
    }

    public void setMarketplaceType(MarketplaceType marketplaceType) {
        this.marketplaceType = marketplaceType;
    }
}
