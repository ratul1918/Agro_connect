package com.arpon007.agro.dto;

public class SignupRequest {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String country; // Bangladesh, India, USA, etc.
    private String division;
    private String district;
    private String upazila;
    private String thana;
    private String postCode;
    private String role; // FARMER, BUYER, etc.

    public SignupRequest() {
    }

    public SignupRequest(String fullName, String email, String password, String phone, String country, String division,
            String district, String upazila, String thana, String postCode, String role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.country = country;
        this.division = division;
        this.district = district;
        this.upazila = upazila;
        this.thana = thana;
        this.postCode = postCode;
        this.role = role;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
