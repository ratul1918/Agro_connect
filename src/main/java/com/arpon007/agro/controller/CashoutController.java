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
}
