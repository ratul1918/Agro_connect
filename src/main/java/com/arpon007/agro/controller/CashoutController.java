package com.arpon007.agro.controller;

import com.arpon007.agro.dto.CashoutRequestDTO;
import com.arpon007.agro.model.CashoutRequest;
import com.arpon007.agro.security.CustomUserDetails;
import com.arpon007.agro.service.CashoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cashout")
@CrossOrigin(origins = "${app.frontend.url}")
public class CashoutController {

        private final CashoutService cashoutService;

        public CashoutController(CashoutService cashoutService) {
                this.cashoutService = cashoutService;
        }

        /**
         * Create cashout request
         */
        @PostMapping("/request")
        public ResponseEntity<Map<String, Object>> requestCashout(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @RequestBody CashoutRequestDTO requestDTO) {
                try {
                        CashoutRequest request = new CashoutRequest();
                        request.setUserId(userDetails.getId());
                        request.setAmount(requestDTO.getAmount());
                        request.setPaymentMethod(requestDTO.getPaymentMethod());
                        request.setAccountDetails(requestDTO.getAccountDetails());

                        CashoutRequest created = cashoutService.requestCashout(request);

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("message", "Cashout request submitted successfully");
                        response.put("request", created);

                        return ResponseEntity.status(HttpStatus.CREATED).body(response);
                } catch (IllegalArgumentException e) {
                        Map<String, Object> error = new HashMap<>();
                        error.put("success", false);
                        error.put("message", e.getMessage());
                        return ResponseEntity.badRequest().body(error);
                }
        }

        /**
         * Get user's cashout requests
         */
        @GetMapping("/my-requests")
        public ResponseEntity<List<CashoutRequest>> getMyCashoutRequests(
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                List<CashoutRequest> requests = cashoutService.getUserCashouts(userDetails.getId());
                return ResponseEntity.ok(requests);
        }

        /**
         * Get cashout request by ID (for invoice download)
         */
        @GetMapping("/{id}")
        public ResponseEntity<CashoutRequest> getCashoutRequest(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id) {
                try {
                        CashoutRequest request = cashoutService.getRequestById(id);

                        // Ensure user can only access their own requests
                        if (!request.getUserId().equals(userDetails.getId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                        }

                        return ResponseEntity.ok(request);
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.notFound().build();
                }
        }

        /**
         * Generate invoice for cashout request
         */
        @GetMapping(value = "/{id}/invoice", produces = "text/html")
        public ResponseEntity<String> getCashoutInvoice(@PathVariable Long id) {
                try {
                        CashoutRequest request = cashoutService.getRequestById(id);

                        // Only approved cashouts have invoices
                        if (!request.isApproved()) {
                                return ResponseEntity.badRequest()
                                                .body("<h1>Invoice only available for approved cashouts</h1>");
                        }

                        String invoice = generateInvoiceHtml(request);
                        return ResponseEntity.ok(invoice);
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("<h1>Error generating invoice</h1>");
                }
        }

        private String generateInvoiceHtml(CashoutRequest request) {
                return String.format(
                                """
                                                <!DOCTYPE html>
                                                <html>
                                                <head>
                                                    <meta charset="UTF-8">
                                                    <title>Cashout Invoice #%d</title>
                                                    <style>
                                                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
                                                        .header { text-align: center; margin-bottom: 30px; }
                                                        .header h1 { color: #16a34a; margin: 0; }
                                                        .invoice-details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                                                        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
                                                        .label { font-weight: bold; }
                                                        .amount { font-size: 24px; color: #16a34a; font-weight: bold; }
                                                        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                                                        .status { display: inline-block; padding: 5px 15px; background: #16a34a; color: white; border-radius: 4px; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <div class="header">
                                                        <h1>🌾 Agro Connect</h1>
                                                        <p>Cashout Invoice</p>
                                                    </div>

                                                    <div class="invoice-details">
                                                        <div class="detail-row">
                                                            <span class="label">Invoice Number:</span>
                                                            <span>CASHOUT-%d</span>
                                                        </div>
                                                        <div class="detail-row">
                                                            <span class="label">Date:</span>
                                                            <span>%s</span>
                                                        </div>
                                                        <div class="detail-row">
                                                            <span class="label">Status:</span>
                                                            <span class="status">APPROVED</span>
                                                        </div>
                                                        <div class="detail-row">
                                                            <span class="label">Payment Method:</span>
                                                            <span>%s</span>
                                                        </div>
                                                        <div class="detail-row">
                                                            <span class="label">Account Details:</span>
                                                            <span>%s</span>
                                                        </div>
                                                    </div>

                                                    <div style="text-align: center; padding: 30px; background: #f9fafb; border-radius: 8px;">
                                                        <p style="margin: 0; color: #6b7280;">Amount Withdrawn</p>
                                                        <p class="amount">৳%s</p>
                                                    </div>

                                                    <div class="footer">
                                                        <p>Thank you for using Agro Connect</p>
                                                        <p>This is a computer-generated invoice</p>
                                                    </div>
                                                </body>
                                                </html>
                                                """,
                                request.getId(),
                                request.getId(),
                                new java.text.SimpleDateFormat("dd MMM yyyy").format(request.getRequestedAt()),
                                request.getPaymentMethod(),
                                request.getAccountDetails() != null ? request.getAccountDetails() : "N/A",
                                request.getAmount());
        }
}
