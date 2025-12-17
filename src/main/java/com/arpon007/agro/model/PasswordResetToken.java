package com.arpon007.agro.model;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;

public class PasswordResetToken {
    private static final int EXPIRATION = 60 * 24; // 24 hours

    private Long id;
    private String token;
    private Long userId;
    private Date expiryDate;

    public PasswordResetToken() {
    }

    public PasswordResetToken(String token, Long userId) {
        this.token = token;
        this.userId = userId;
        this.expiryDate = calculateExpiryDate(EXPIRATION);
    }

    public PasswordResetToken(Long id, String token, Long userId, Date expiryDate) {
        this.id = id;
        this.token = token;
        this.userId = userId;
        this.expiryDate = expiryDate;
    }

    private Date calculateExpiryDate(int expiryTimeInMinutes) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Timestamp(cal.getTime().getTime()));
        cal.add(Calendar.MINUTE, expiryTimeInMinutes);
        return new Date(cal.getTime().getTime());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
}
