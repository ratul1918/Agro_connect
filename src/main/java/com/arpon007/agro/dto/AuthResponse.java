package com.arpon007.agro.dto;

public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String role;
    private String fullName;
    private String profileImageUrl;
    private String phone;
    private String division;
    private String district;
    private String upazila;
    private String thana;
    private String postCode;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String email, String role, String fullName, String profileImageUrl,
            String phone, String division, String district, String upazila, String thana, String postCode) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.profileImageUrl = profileImageUrl;
        this.phone = phone;
        this.division = division;
        this.district = district;
        this.upazila = upazila;
        this.thana = thana;
        this.postCode = postCode;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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
}
