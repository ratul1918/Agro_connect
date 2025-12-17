package com.arpon007.agro.controller;

import com.arpon007.agro.model.Bid;
import com.arpon007.agro.repository.BidRepository;
import com.arpon007.agro.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
public class BiddingController {

    private final BidRepository bidRepository;
    private final JwtUtil jwtUtil;

    public BiddingController(BidRepository bidRepository, JwtUtil jwtUtil) {
        this.bidRepository = bidRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/{cropId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<String> placeBid(
            @PathVariable Long cropId,
            @RequestBody Map<String, BigDecimal> payload,
            HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));
        BigDecimal amount = payload.get("amount");

        Bid bid = new Bid();
        bid.setCropId(cropId);
        bid.setBuyerId(userId);
        bid.setAmount(amount);

        bidRepository.placeBid(bid);

        // TODO: Send WebSocket notification to Farmer

        return ResponseEntity.ok("Bid placed successfully");
    }

    @GetMapping("/{cropId}")
    public ResponseEntity<List<Bid>> getBids(@PathVariable Long cropId) {
        return ResponseEntity.ok(bidRepository.findByCropId(cropId));
    }

    @PutMapping("/{bidId}/status")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<String> updateBidStatus(@PathVariable Long bidId, @RequestParam String status) {
        bidRepository.updateStatus(bidId, status);
        return ResponseEntity.ok("Bid status updated");
    }
}
