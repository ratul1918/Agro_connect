package com.arpon007.agro.controller;

import com.arpon007.agro.model.Transaction;
import com.arpon007.agro.model.Wallet;
import com.arpon007.agro.security.CustomUserDetails;
import com.arpon007.agro.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "${app.frontend.url}")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Get wallet information
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getWallet(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Wallet wallet = walletService.getOrCreateWallet(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("balance", wallet.getBalance());
        response.put("totalEarned", wallet.getTotalEarned());
        response.put("totalWithdrawn", wallet.getTotalWithdrawn());
        response.put("userId", wallet.getUserId());

        return ResponseEntity.ok(response);
    }

    /**
     * Get transaction history
     */
    @GetMapping("/transactions")
    public ResponseEntity<Map<String, Object>> getTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Transaction> transactions = walletService.getTransactionHistory(userDetails.getId(), page, size);
        long totalCount = walletService.getTransactionCount(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("transactions", transactions);
        response.put("totalCount", totalCount);
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (totalCount + size - 1) / size);

        return ResponseEntity.ok(response);
    }

    /**
     * Get wallet balance only
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Wallet wallet = walletService.getOrCreateWallet(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("balance", wallet.getBalance());
        return ResponseEntity.ok(response);
    }

    /**
     * Add cash to wallet (simulated payment gateway)
     */
    @PostMapping("/add-cash")
    public ResponseEntity<Map<String, Object>> addCash(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            Object amountObj = payload.get("amount");
            if (amountObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
            }

            java.math.BigDecimal amount = new java.math.BigDecimal(amountObj.toString());
            if (amount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount must be positive"));
            }

            // In production, this would integrate with bKash/Nagad/etc.
            // For now, just credit the wallet
            Wallet wallet = walletService.creditWallet(
                    userDetails.getId(),
                    amount,
                    com.arpon007.agro.model.Transaction.TransactionSource.BONUS,
                    "Wallet top-up via payment gateway");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "টাকা যোগ হয়েছে");
            response.put("newBalance", wallet.getBalance());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
