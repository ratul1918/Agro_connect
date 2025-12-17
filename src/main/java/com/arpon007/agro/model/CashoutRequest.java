package com.arpon007.agro.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class CashoutRequest {

    public enum CashoutStatus {
        PENDING, APPROVED, REJECTED, PAID
    }

    public enum PaymentMethod {
        BANK, BKASH, NAGAD, ROCKET
    }

    private Long id;
    private Long userId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String accountDetails;
    private CashoutStatus status = CashoutStatus.PENDING;
    private String adminNote;
    private String invoiceUrl;
    private String transactionRef;
    private Timestamp requestedAt;
    private Timestamp processedAt;
    private Long processedBy;

    // For joined data
    private String userName;
    private String userEmail;

    // Custom constructor for database row mapping (without userName/userEmail which
    // are set separately)
    public CashoutRequest(Long id, Long userId, BigDecimal amount, PaymentMethod paymentMethod,
            String accountDetails, CashoutStatus status, String adminNote,
            String invoiceUrl, String transactionRef, Timestamp requestedAt,
            Timestamp processedAt, Long processedBy) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.accountDetails = accountDetails;
        this.status = status;
        this.adminNote = adminNote;
        this.invoiceUrl = invoiceUrl;
        this.transactionRef = transactionRef;
        this.requestedAt = requestedAt;
        this.processedAt = processedAt;
        this.processedBy = processedBy;
    }

    // Business methods
    public boolean isPending() {
        return CashoutStatus.PENDING.equals(this.status);
    }

    public boolean isApproved() {
        return CashoutStatus.APPROVED.equals(this.status);
    }

    public boolean isPaid() {
        return CashoutStatus.PAID.equals(this.status);
    }

    public void approve(Long adminId, String invoiceUrl) {
        this.status = CashoutStatus.APPROVED;
        this.processedBy = adminId;
        this.processedAt = new Timestamp(System.currentTimeMillis());
        this.invoiceUrl = invoiceUrl;
    }

    public void reject(Long adminId, String reason) {
        this.status = CashoutStatus.REJECTED;
        this.processedBy = adminId;
        this.processedAt = new Timestamp(System.currentTimeMillis());
        this.adminNote = reason;
    }

    public void markAsPaid(String transactionRef) {
        this.status = CashoutStatus.PAID;
        this.transactionRef = transactionRef;
    }
}
