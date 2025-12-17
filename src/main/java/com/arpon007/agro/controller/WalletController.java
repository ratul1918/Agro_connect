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
}
