package com.arpon007.agro.model;

import java.time.LocalDateTime;

public class AIApiKey {
    private Long id;
    private String provider;
    private String apiKeyEncrypted;
    private KeyType keyType;
    private boolean isActive;
    private LocalDateTime lastValidated;
    private ValidationStatus validationStatus;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum KeyType {
        PRODUCTION,
        TESTING
    }

    public enum ValidationStatus {
        VALID,
        INVALID,
        PENDING,
        EXPIRED
    }

    // Constructors
    public AIApiKey() {}

    public AIApiKey(String provider, String apiKeyEncrypted, KeyType keyType, Long createdBy) {
        this.provider = provider;
        this.apiKeyEncrypted = apiKeyEncrypted;
        this.keyType = keyType;
        this.isActive = true;
        this.validationStatus = ValidationStatus.PENDING;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getApiKeyEncrypted() {
        return apiKeyEncrypted;
    }

    public void setApiKeyEncrypted(String apiKeyEncrypted) {
        this.apiKeyEncrypted = apiKeyEncrypted;
    }

    public KeyType getKeyType() {
        return keyType;
    }

    public void setKeyType(KeyType keyType) {
        this.keyType = keyType;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getLastValidated() {
        return lastValidated;
    }

    public void setLastValidated(LocalDateTime lastValidated) {
        this.lastValidated = lastValidated;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}