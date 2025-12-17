package com.arpon007.agro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {
    private Long id;
    private Long userId;
    private BigDecimal balance = BigDecimal.ZERO;
    private BigDecimal totalEarned = BigDecimal.ZERO;
    private BigDecimal totalWithdrawn = BigDecimal.ZERO;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // Business methods
    public void credit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        this.balance = this.balance.add(amount);
        this.totalEarned = this.totalEarned.add(amount);
    }

    public void debit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        if (amount.compareTo(this.balance) > 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        this.balance = this.balance.subtract(amount);
        this.totalWithdrawn = this.totalWithdrawn.add(amount);
    }

    public boolean canWithdraw(BigDecimal amount) {
        return amount.compareTo(BigDecimal.ZERO) > 0 &&
                amount.compareTo(this.balance) <= 0;
    }
}
