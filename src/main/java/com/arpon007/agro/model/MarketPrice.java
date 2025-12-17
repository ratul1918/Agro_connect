package com.arpon007.agro.model;

import java.math.BigDecimal;
import java.sql.Date;

public class MarketPrice {
    private Long id;
    private Integer cropTypeId;
    private String district;
    private BigDecimal price;
    private Date priceDate;

    // Extra
    private String cropTypeName;

    public MarketPrice() {
    }

    public MarketPrice(Long id, Integer cropTypeId, String district, BigDecimal price, Date priceDate,
            String cropTypeName) {
        this.id = id;
        this.cropTypeId = cropTypeId;
        this.district = district;
        this.price = price;
        this.priceDate = priceDate;
        this.cropTypeName = cropTypeName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCropTypeId() {
        return cropTypeId;
    }

    public void setCropTypeId(Integer cropTypeId) {
        this.cropTypeId = cropTypeId;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Date getPriceDate() {
        return priceDate;
    }

    public void setPriceDate(Date priceDate) {
        this.priceDate = priceDate;
    }

    public String getCropTypeName() {
        return cropTypeName;
    }

    public void setCropTypeName(String cropTypeName) {
        this.cropTypeName = cropTypeName;
    }
}
