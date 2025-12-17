package com.arpon007.agro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    public enum TransactionType {
        CREDIT, DEBIT
    }

    public enum TransactionSource {
        SALE, CASHOUT, REFUND, BONUS, ADJUSTMENT, ORDER_PAYMENT, DEPOSIT
    }

    private Long id;
    private Long walletId;
    private TransactionType type;
    private BigDecimal amount;
    private TransactionSource source;
    private Long referenceId;
    private String description;
    private Timestamp createdAt;
}
