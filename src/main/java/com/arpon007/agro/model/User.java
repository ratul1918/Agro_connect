package com.arpon007.agro.model;

import java.sql.Timestamp;
import java.util.Set;

public class User {
    private Long id;
    private String fullName;
    private String email;
    private boolean emailVerified;
    private String passwordHash;
    private String phone;
    private String country; // Bangladesh, India, USA, etc.
    private String division;
    private String district;
    private String upazila;
    private String thana;
    private String postCode;
    private String profileImageUrl;
    private boolean isVerified;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private Set<String> roles;

    public User() {
    }

    public User(Long id, String fullName, String email, String passwordHash, Set<String> roles) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    public User(Long id, String fullName, String email, String passwordHash, String phone, String country,
            String division, String district, String upazila, String thana, String postCode, String profileImageUrl,
            boolean isVerified, Timestamp createdAt, Timestamp updatedAt, Set<String> roles) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.country = country;
        this.division = division;
        this.district = district;
        this.upazila = upazila;
        this.thana = thana;
        this.postCode = postCode;
        this.profileImageUrl = profileImageUrl;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDivision() {
        return division;
    }

    public void setDivision(String division) {
        this.division = division;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getUpazila() {
        return upazila;
    }

    public void setUpazila(String upazila) {
        this.upazila = upazila;
    }

    public String getThana() {
        return thana;
    }

    public void setThana(String thana) {
        this.thana = thana;
    }

    public String getPostCode() {
        return postCode;
    }

    public void setPostCode(String postCode) {
        this.postCode = postCode;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
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

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
