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
import java.util.Optional;

@RestController
@RequestMapping("/api/bids")
public class BiddingController {

    private final BidRepository bidRepository;
    private final JwtUtil jwtUtil;

    public BiddingController(BidRepository bidRepository, JwtUtil jwtUtil) {
        this.bidRepository = bidRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Place a new bid on a crop (Buyers, Farmers, and Admins)
     */
    @PostMapping("/{cropId}")
    @PreAuthorize("hasAnyRole('BUYER', 'FARMER', 'ADMIN')")
    public ResponseEntity<String> placeBid(
            @PathVariable Long cropId,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Long userId = extractUserId(request);

        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        BigDecimal quantity = payload.get("quantity") != null
                ? new BigDecimal(payload.get("quantity").toString())
                : new BigDecimal("80");

        Bid bid = new Bid();
        bid.setCropId(cropId);
        bid.setBuyerId(userId);
        bid.setAmount(amount);
        bid.setQuantity(quantity);

        bidRepository.placeBid(bid);

        return ResponseEntity.ok("Bid placed successfully");
    }

    /**
     * Get all bids for a crop
     */
    @GetMapping("/crop/{cropId}")
    public ResponseEntity<List<Bid>> getBidsByCrop(@PathVariable Long cropId) {
        return ResponseEntity.ok(bidRepository.findByCropId(cropId));
    }

    /**
     * Get buyer's bids
     */
    @GetMapping("/my-bids")
    @PreAuthorize("hasAnyRole('BUYER', 'FARMER', 'ADMIN')")
    public ResponseEntity<List<Bid>> getMyBids(HttpServletRequest request) {
        Long userId = extractUserId(request);
        String role = extractRole(request);

        if ("ROLE_ADMIN".equals(role)) {
            // Admin sees all bids
            return ResponseEntity.ok(bidRepository.findAll());
        }
        return ResponseEntity.ok(bidRepository.findByBuyerId(userId));
    }

    /**
     * Get farmer's incoming bids
     */
    @GetMapping("/farmer-bids")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<List<Bid>> getFarmerBids(HttpServletRequest request) {
        Long userId = extractUserId(request);
        String role = extractRole(request);

        if ("ROLE_ADMIN".equals(role)) {
            // Admin sees all bids
            return ResponseEntity.ok(bidRepository.findAll());
        }
        return ResponseEntity.ok(bidRepository.findByFarmerId(userId));
    }

    /**
     * Farmer counter-offer (Farmers and Admins)
     */
    @PutMapping("/{bidId}/counter")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<String> counterOffer(
            @PathVariable Long bidId,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        BigDecimal counterPrice = new BigDecimal(payload.get("counterPrice").toString());

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Verify farmer owns the crop or is admin
        Long userId = extractUserId(request);
        String role = extractRole(request);
        Bid bid = bidOpt.get();

        if (!"ROLE_ADMIN".equals(role) && !bid.getFarmerId().equals(userId)) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        bidRepository.farmerCounterOffer(bidId, counterPrice);
        return ResponseEntity.ok("Counter-offer sent");
    }

    /**
     * Buyer responds to counter-offer
     */
    @PutMapping("/{bidId}/buyer-respond")
    @PreAuthorize("hasAnyRole('BUYER', 'FARMER', 'ADMIN')")
    public ResponseEntity<String> buyerRespond(
            @PathVariable Long bidId,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        String action = payload.get("action").toString(); // "accept" or "counter"

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long userId = extractUserId(request);
        String role = extractRole(request);
        Bid bid = bidOpt.get();

        if (!"ROLE_ADMIN".equals(role) && !bid.getBuyerId().equals(userId)) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        if ("accept".equals(action)) {
            bidRepository.acceptBid(bidId);
            return ResponseEntity.ok("Bid accepted! You can now purchase at the agreed price.");
        } else if ("counter".equals(action)) {
            BigDecimal newAmount = new BigDecimal(payload.get("amount").toString());
            bidRepository.buyerUpdateBid(bidId, newAmount);
            return ResponseEntity.ok("New bid amount sent to farmer");
        }

        return ResponseEntity.badRequest().body("Invalid action");
    }

    /**
     * Accept bid (Farmer accepts buyer's offer)
     */
    @PutMapping("/{bidId}/accept")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<String> acceptBid(
            @PathVariable Long bidId,
            HttpServletRequest request) {

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long userId = extractUserId(request);
        String role = extractRole(request);
        Bid bid = bidOpt.get();

        if (!"ROLE_ADMIN".equals(role) && !bid.getFarmerId().equals(userId)) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        bidRepository.acceptBid(bidId);
        return ResponseEntity.ok("Bid accepted");
    }

    /**
     * Reject bid
     */
    @PutMapping("/{bidId}/reject")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<String> rejectBid(
            @PathVariable Long bidId,
            HttpServletRequest request) {

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long userId = extractUserId(request);
        String role = extractRole(request);
        Bid bid = bidOpt.get();

        if (!"ROLE_ADMIN".equals(role) && !bid.getFarmerId().equals(userId)) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        bidRepository.rejectBid(bidId);
        return ResponseEntity.ok("Bid rejected");
    }

    /**
     * Delete bid (Both buyer and farmer can delete)
     */
    @DeleteMapping("/{bidId}")
    @PreAuthorize("hasAnyRole('BUYER', 'FARMER', 'ADMIN')")
    public ResponseEntity<String> deleteBid(
            @PathVariable Long bidId,
            HttpServletRequest request) {

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long userId = extractUserId(request);
        String role = extractRole(request);
        Bid bid = bidOpt.get();

        // Allow if admin, buyer who placed bid, or farmer who owns crop
        boolean isAdmin = "ROLE_ADMIN".equals(role);
        boolean isBuyerOwner = bid.getBuyerId().equals(userId);
        boolean isFarmerOwner = bid.getFarmerId().equals(userId);

        if (!isAdmin && !isBuyerOwner && !isFarmerOwner) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        bidRepository.deleteBid(bidId);
        return ResponseEntity.ok("Bid deleted");
    }

    /**
     * Get single bid by ID
     */
    @GetMapping("/{bidId}")
    public ResponseEntity<Bid> getBid(@PathVariable Long bidId) {
        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bidOpt.get());
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractClaim(token, claims -> {
            Object idObj = claims.get("userId");
            if (idObj instanceof Integer) {
                return ((Integer) idObj).longValue();
            } else if (idObj instanceof Long) {
                return (Long) idObj;
            } else {
                return Long.parseLong(String.valueOf(idObj));
            }
        });
    }

    private String extractRole(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
    }
}
