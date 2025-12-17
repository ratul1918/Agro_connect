package com.arpon007.agro.controller;

import com.arpon007.agro.model.CashoutRequest;
import com.arpon007.agro.model.CashoutRequest.CashoutStatus;
import com.arpon007.agro.security.CustomUserDetails;
import com.arpon007.agro.service.CashoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cashout")
@CrossOrigin(origins = "${app.frontend.url}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCashoutController {

    private final CashoutService cashoutService;

    public AdminCashoutController(CashoutService cashoutService) {
        this.cashoutService = cashoutService;
    }

    /**
     * Get pending cashout requests
     */
    @GetMapping("/pending")
    public ResponseEntity<List<CashoutRequest>> getPendingRequests() {
        List<CashoutRequest> requests = cashoutService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * Get cashout requests by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CashoutRequest>> getRequestsByStatus(@PathVariable String status) {
        try {
            CashoutStatus cashoutStatus = CashoutStatus.valueOf(status.toUpperCase());
            List<CashoutRequest> requests = cashoutService.getRequestsByStatus(cashoutStatus);
            return ResponseEntity.ok(requests);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all cashout requests grouped by status
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllRequests() {
        Map<String, Object> response = new HashMap<>();
        response.put("pending", cashoutService.getRequestsByStatus(CashoutStatus.PENDING));
        response.put("approved", cashoutService.getRequestsByStatus(CashoutStatus.APPROVED));
        response.put("rejected", cashoutService.getRequestsByStatus(CashoutStatus.REJECTED));
        response.put("paid", cashoutService.getRequestsByStatus(CashoutStatus.PAID));
        response.put("pendingCount", cashoutService.getPendingCount());
        return ResponseEntity.ok(response);
    }

    /**
     * Approve cashout request
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveCashout(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            CashoutRequest approved = cashoutService.approveCashout(id, userDetails.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cashout request approved successfully");
            response.put("request", approved);
            response.put("invoiceUrl", approved.getInvoiceUrl());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Reject cashout request
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectCashout(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String reason = payload.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Rejection reason is required");
                return ResponseEntity.badRequest().body(error);
            }

            CashoutRequest rejected = cashoutService.rejectCashout(id, userDetails.getId(), reason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cashout request rejected");
            response.put("request", rejected);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Mark cashout as paid
     */
    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<Map<String, Object>> markAsPaid(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String transactionRef = payload.get("transactionRef");
            CashoutRequest paid = cashoutService.markAsPaid(id, transactionRef);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cashout marked as paid");
            response.put("request", paid);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
