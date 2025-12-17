package com.arpon007.agro.dto;

import com.arpon007.agro.model.CashoutRequest.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashoutRequestDTO {
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String accountDetails;
}
