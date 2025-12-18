package com.arpon007.agro.controller;

import com.arpon007.agro.repository.FeatureRepository;
import com.arpon007.agro.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/features")
public class FeatureController {

    private final FeatureRepository featureRepository;
    private final JwtUtil jwtUtil;

    public FeatureController(FeatureRepository featureRepository, JwtUtil jwtUtil) {
        this.featureRepository = featureRepository;
        this.jwtUtil = jwtUtil;
    }

    // Export
    @PostMapping("/export/apply")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<String> applyForExport(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));

        String details = (String) payload.get("cropDetails");
        BigDecimal qty = new BigDecimal(payload.get("quantity").toString());
        String dest = (String) payload.get("destination");

        featureRepository.applyForExport(userId, details, qty, dest);
        return ResponseEntity.ok("Export application submitted");
    }

    // Subsidy
    @GetMapping("/subsidy/schemes")
    public ResponseEntity<List<Map<String, Object>>> getSubsidySchemes() {
        return ResponseEntity.ok(featureRepository.getSubsidySchemes());
    }

    @PostMapping("/subsidy/apply")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<String> applyForSubsidy(@RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));

        Integer schemeId = (Integer) payload.get("schemeId");
        featureRepository.applyForSubsidy(userId, schemeId);
        return ResponseEntity.ok("Subsidy application submitted");
    }

    // Reviews
    @PostMapping("/review")
    public ResponseEntity<String> addReview(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long reviewerId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));

        Long targetId = Long.valueOf(payload.get("targetUserId").toString());
        Integer rating = (Integer) payload.get("rating");
        String comment = (String) payload.get("comment");

        featureRepository.addReview(reviewerId, targetId, rating, comment);
        return ResponseEntity.ok("Review added");
    }

    // ==================== FARMER SPECIFIC ====================

    @GetMapping("/farmer/exports")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<Map<String, Object>>> getFarmerExports(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        return ResponseEntity.ok(featureRepository.getExportApplicationsByFarmer(userId));
    }

    @GetMapping("/farmer/orders")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<Map<String, Object>>> getFarmerOrders(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        return ResponseEntity.ok(featureRepository.getOrdersByFarmer(userId));
    }

    @GetMapping("/farmer/bids")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<Map<String, Object>>> getFarmerBids(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        return ResponseEntity.ok(featureRepository.getBidsForFarmer(userId));
    }

    @PutMapping("/farmer/bids/{id}/accept")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<String> acceptBid(@PathVariable Long id) {
        featureRepository.updateBidStatus(id, "ACCEPTED");
        return ResponseEntity.ok("Bid accepted");
    }

    @PutMapping("/farmer/bids/{id}/reject")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<String> rejectBid(@PathVariable Long id) {
        featureRepository.updateBidStatus(id, "REJECTED");
        return ResponseEntity.ok("Bid rejected");
    }

    @GetMapping("/farmer/pending-money")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, Object>> getFarmerPendingMoney(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        BigDecimal pendingMoney = featureRepository.getPendingMoneyForFarmer(userId);
        return ResponseEntity.ok(Map.of("pendingMoney", pendingMoney));
    }

    @GetMapping("/farmer/total-income")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, Object>> getFarmerTotalIncome(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        BigDecimal totalIncome = featureRepository.getTotalIncomeForFarmer(userId);
        return ResponseEntity.ok(Map.of("totalIncome", totalIncome));
    }

    // ==================== BUYER SPECIFIC ====================

    @GetMapping("/buyer/orders")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<Map<String, Object>>> getBuyerOrders(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        return ResponseEntity.ok(featureRepository.getOrdersByBuyer(userId));
    }

    @GetMapping("/buyer/bids")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<Map<String, Object>>> getBuyerBids(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        return ResponseEntity.ok(featureRepository.getBidsByBuyer(userId));
    }
}
