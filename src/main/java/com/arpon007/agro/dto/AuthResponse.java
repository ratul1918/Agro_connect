package com.arpon007.agro.dto;

public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String role;
    private String fullName;
    private String profileImageUrl;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String email, String role, String fullName, String profileImageUrl) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.profileImageUrl = profileImageUrl;
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
}
