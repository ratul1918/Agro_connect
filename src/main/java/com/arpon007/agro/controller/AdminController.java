package com.arpon007.agro.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arpon007.agro.model.Crop;
import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.CropRepository;
import com.arpon007.agro.repository.FeatureRepository;
import com.arpon007.agro.repository.UserRepository;
import com.arpon007.agro.service.CashoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final FeatureRepository featureRepository;
    private final CropRepository cropRepository;
    private final com.arpon007.agro.repository.AppConfigRepository appConfigRepository;
    private final com.arpon007.agro.repository.OrderRepository orderRepository;
    private final com.arpon007.agro.service.WalletService walletService;

    public AdminController(UserRepository userRepository, FeatureRepository featureRepository,
            CropRepository cropRepository,
            com.arpon007.agro.repository.AppConfigRepository appConfigRepository,
            com.arpon007.agro.repository.OrderRepository orderRepository,
            com.arpon007.agro.service.WalletService walletService) {
        this.userRepository = userRepository;
        this.featureRepository = featureRepository;
        this.cropRepository = cropRepository;
        this.appConfigRepository = appConfigRepository;
        this.orderRepository = orderRepository;
        this.walletService = walletService;
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Content Management
    @DeleteMapping("/crops/{id}")
    public ResponseEntity<String> deleteCrop(@PathVariable Long id) {
        featureRepository.deleteCrop(id);
        return ResponseEntity.ok("Crop listing removed");
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        featureRepository.deleteReview(id);
        return ResponseEntity.ok("Review removed");
    }

    // ==================== CROP MANAGEMENT ====================

    /**
     * Get all crops for admin management
     */
    @GetMapping("/crops")
    public ResponseEntity<List<Crop>> getAllCrops() {
        return ResponseEntity.ok(cropRepository.findAllForAdmin());
    }

    /**
     * Update quantity settings for a crop
     * Admin can set minimum wholesale quantity (for buyers) and retail quantity
     * limits (for customers)
     */
    @PutMapping("/crops/{id}/quantity-settings")
    public ResponseEntity<Map<String, String>> updateCropQuantitySettings(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {

        BigDecimal minWholesaleQty = payload.get("minWholesaleQty") != null
                ? new BigDecimal(payload.get("minWholesaleQty").toString())
                : null;
        BigDecimal minRetailQty = payload.get("minRetailQty") != null
                ? new BigDecimal(payload.get("minRetailQty").toString())
                : null;
        BigDecimal maxRetailQty = payload.get("maxRetailQty") != null
                ? new BigDecimal(payload.get("maxRetailQty").toString())
                : null;

        // Validate
        if (minWholesaleQty != null && minWholesaleQty.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Minimum wholesale quantity must be greater than 0"));
        }
        if (minRetailQty != null && minRetailQty.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Minimum retail quantity must be greater than 0"));
        }
        if (maxRetailQty != null && minRetailQty != null && maxRetailQty.compareTo(minRetailQty) <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Maximum retail quantity must be greater than minimum"));
        }

        cropRepository.updateQuantitySettings(id, minWholesaleQty, minRetailQty, maxRetailQty);

        return ResponseEntity.ok(Map.of(
                "message", "Quantity settings updated successfully",
                "cropId", id.toString()));
    }

    /**
     * Update pricing settings for a crop
     * Admin can set wholesale price, retail price, profit margin, and fixed costs
     */
    @PutMapping("/crops/{id}/pricing-settings")
    public ResponseEntity<Map<String, String>> updateCropPricingSettings(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {

        BigDecimal wholesalePrice = payload.get("wholesalePrice") != null
                ? new BigDecimal(payload.get("wholesalePrice").toString())
                : null;
        BigDecimal retailPrice = payload.get("retailPrice") != null
                ? new BigDecimal(payload.get("retailPrice").toString())
                : null;
        BigDecimal profitMarginPercent = payload.get("profitMarginPercent") != null
                ? new BigDecimal(payload.get("profitMarginPercent").toString())
                : null;
        BigDecimal fixedCostPerUnit = payload.get("fixedCostPerUnit") != null
                ? new BigDecimal(payload.get("fixedCostPerUnit").toString())
                : null;

        cropRepository.updatePricingSettings(id, wholesalePrice, retailPrice, profitMarginPercent, fixedCostPerUnit);

        return ResponseEntity.ok(Map.of(
                "message", "Pricing settings updated successfully",
                "cropId", id.toString()));
    }

    /**
     * Bulk update default quantity settings for all crops
     */
    @PutMapping("/crops/bulk-quantity-settings")
    public ResponseEntity<Map<String, String>> updateBulkQuantitySettings(
            @RequestBody Map<String, Object> payload) {

        BigDecimal minWholesaleQty = payload.get("minWholesaleQty") != null
                ? new BigDecimal(payload.get("minWholesaleQty").toString())
                : new BigDecimal("80");
        BigDecimal minRetailQty = payload.get("minRetailQty") != null
                ? new BigDecimal(payload.get("minRetailQty").toString())
                : new BigDecimal("0.1");
        BigDecimal maxRetailQty = payload.get("maxRetailQty") != null
                ? new BigDecimal(payload.get("maxRetailQty").toString())
                : new BigDecimal("10");

        // Update all crops
        List<Crop> crops = cropRepository.findAllForAdmin();
        for (Crop crop : crops) {
            cropRepository.updateQuantitySettings(crop.getId(), minWholesaleQty, minRetailQty, maxRetailQty);
        }

        // Also save as default config
        appConfigRepository.setValue("default_min_wholesale_qty", minWholesaleQty.toString());
        appConfigRepository.setValue("default_min_retail_qty", minRetailQty.toString());
        appConfigRepository.setValue("default_max_retail_qty", maxRetailQty.toString());

        return ResponseEntity.ok(Map.of(
                "message", "Bulk quantity settings updated for " + crops.size() + " crops",
                "cropsUpdated", String.valueOf(crops.size())));
    }

    // System Config
    @GetMapping("/config")
    public ResponseEntity<java.util.Map<String, String>> getSystemConfig() {
        return ResponseEntity.ok(appConfigRepository.getAllConfigs());
    }

    @PostMapping("/config")
    public ResponseEntity<String> updateSystemConfig(@RequestBody java.util.Map<String, String> payload) {
        payload.forEach(appConfigRepository::setValue);
        return ResponseEntity.ok("Configuration updated");
    }

    // ==================== AGRONOMIST MANAGEMENT ====================

    /**
     * Create a new agronomist user
     * Admin provides name, email, password and the agronomist can login
     */
    @PostMapping("/users/agronomist")
    public ResponseEntity<?> createAgronomist(@RequestBody Map<String, String> payload) {
        try {
            String fullName = payload.get("fullName");
            String email = payload.get("email");
            String password = payload.get("password");
            String phone = payload.get("phone");

            if (fullName == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name, email and password are required"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }

            // Create user
            User agronomist = new User();
            agronomist.setFullName(fullName);
            agronomist.setEmail(email);
            agronomist.setPasswordHash(
                    new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(password));
            agronomist.setPhone(phone);
            agronomist.setVerified(true); // Admin-created users are auto-verified

            User savedUser = userRepository.save(agronomist);
            userRepository.addRole(savedUser.getId(), "ROLE_AGRONOMIST");

            return ResponseEntity.ok(Map.of(
                    "message", "Agronomist created successfully",
                    "userId", savedUser.getId().toString(),
                    "email", email));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to create agronomist: " + e.getMessage()));
        }
    }

    // ==================== BLOG MANAGEMENT ====================

    /**
     * Get all blogs for admin
     */
    @GetMapping("/blogs")
    public ResponseEntity<List<Map<String, Object>>> getAllBlogs() {
        try {
            List<Map<String, Object>> blogs = featureRepository.getAllBlogsForAdmin();
            return ResponseEntity.ok(blogs);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    /**
     * Delete a blog post
     */
    @DeleteMapping("/blogs/{id}")
    public ResponseEntity<String> deleteBlog(@PathVariable Long id) {
        try {
            featureRepository.deleteBlog(id);
            return ResponseEntity.ok("Blog deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete blog: " + e.getMessage());
        }
    }

    // ==================== EXPORT MANAGEMENT ====================

    /**
     * Get all export applications
     */
    @GetMapping("/export-applications")
    public ResponseEntity<List<Map<String, Object>>> getAllExportApplications() {
        try {
            List<Map<String, Object>> applications = featureRepository.getAllExportApplicationsForAdmin();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    /**
     * Approve an export application
     */
    @PutMapping("/export-applications/{id}/approve")
    public ResponseEntity<String> approveExport(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String notes = payload.get("notes");
            featureRepository.updateExportStatus(id, "APPROVED", notes);
            return ResponseEntity.ok("Export application approved");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to approve: " + e.getMessage());
        }
    }

    /**
     * Reject an export application
     */
    @PutMapping("/export-applications/{id}/reject")
    public ResponseEntity<String> rejectExport(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String notes = payload.get("notes");
            featureRepository.updateExportStatus(id, "REJECTED", notes);
            return ResponseEntity.ok("Export application rejected");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reject: " + e.getMessage());
        }
    }

    // ==================== ORDERS MANAGEMENT ====================

    /**
     * Get all orders
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        try {
            List<Map<String, Object>> orders = featureRepository.getAllOrdersForAdmin();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    /**
     * Update order status
     */
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<String> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            featureRepository.updateOrderStatus(id, status);
            return ResponseEntity.ok("Order status updated to " + status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update order: " + e.getMessage());
        }
    }

    /**
     * Delete an order
     */
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        try {
            featureRepository.deleteOrder(id);
            return ResponseEntity.ok("Order deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete order: " + e.getMessage());
        }
    }

    // ==================== BIDS MANAGEMENT ====================

    /**
     * Get all bids
     */
    @GetMapping("/bids")
    public ResponseEntity<List<Map<String, Object>>> getAllBids() {
        try {
            List<Map<String, Object>> bids = featureRepository.getAllBidsForAdmin();
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }
    // ==================== CASHOUT MANAGEMENT ====================

    @Autowired
    private CashoutService cashoutService;

    /**
     * Get pending cashout requests
     */
    @GetMapping("/cashouts")
    public ResponseEntity<List<com.arpon007.agro.model.CashoutRequest>> getPendingCashouts() {
        return ResponseEntity.ok(cashoutService.getPendingRequests());
    }

    /**
     * Approve cashout request
     */
    @PutMapping("/cashouts/{id}/approve")
    public ResponseEntity<String> approveCashout(@PathVariable Long id,
            @AuthenticationPrincipal com.arpon007.agro.security.CustomUserDetails userDetails) {
        try {
            cashoutService.approveCashout(id, userDetails.getId());
            return ResponseEntity.ok("Cashout request approved");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Reject cashout request
     */
    @PutMapping("/cashouts/{id}/reject")
    public ResponseEntity<String> rejectCashout(@PathVariable Long id,
            @AuthenticationPrincipal com.arpon007.agro.security.CustomUserDetails userDetails,
            @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.get("reason");
            cashoutService.rejectCashout(id, userDetails.getId(), reason);
            return ResponseEntity.ok("Cashout request rejected");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== B2B & RETAIL PRODUCT MANAGEMENT ====================

    /**
     * Create B2B product
     */
    @PostMapping("/crops/b2b")
    public ResponseEntity<?> createB2BProduct(
            @RequestBody com.arpon007.agro.model.Crop crop,
            @AuthenticationPrincipal com.arpon007.agro.security.CustomUserDetails userDetails) {
        try {
            crop.setMarketplaceType(com.arpon007.agro.model.Crop.MarketplaceType.B2B);
            // Admin creates products on behalf of farmers or system
            if (crop.getFarmerId() == null) {
                crop.setFarmerId(userDetails.getId());
            }
            cropRepository.save(crop);
            return ResponseEntity.ok(Map.of("message", "B2B product created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to create B2B product: " + e.getMessage()));
        }
    }

    /**
     * Create Retail product
     */
    @PostMapping("/crops/retail")
    public ResponseEntity<?> createRetailProduct(
            @RequestBody com.arpon007.agro.model.Crop crop,
            @AuthenticationPrincipal com.arpon007.agro.security.CustomUserDetails userDetails) {
        try {
            crop.setMarketplaceType(com.arpon007.agro.model.Crop.MarketplaceType.RETAIL);
            // Admin creates products on behalf of farmers or system
            if (crop.getFarmerId() == null) {
                crop.setFarmerId(userDetails.getId());
            }
            cropRepository.save(crop);
            return ResponseEntity.ok(Map.of("message", "Retail product created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to create retail product: " + e.getMessage()));
        }
    }

    /**
     * Get B2B products
     */
    @GetMapping("/crops/b2b")
    public ResponseEntity<java.util.List<com.arpon007.agro.model.Crop>> getB2BProducts() {
        return ResponseEntity.ok(cropRepository.findByMarketplaceType("B2B"));
    }

    /**
     * Get Retail products
     */
    @GetMapping("/crops/retail")
    public ResponseEntity<java.util.List<com.arpon007.agro.model.Crop>> getRetailProducts() {
        return ResponseEntity.ok(cropRepository.findByMarketplaceType("RETAIL"));
    }

    // ==================== DELIVERY STATUS MANAGEMENT ====================

    /**
     * Update delivery status
     */
    @PutMapping("/orders/{id}/delivery-status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String deliveryStatus = payload.get("deliveryStatus");
            orderRepository.updateDeliveryStatus(id, deliveryStatus);

            // If order is delivered or completed, check if we should mark it as completed
            // and record income
            if ("DELIVERED".equals(deliveryStatus)) {
                // Also update order status to COMPLETED
                orderRepository.updateStatus(id, "COMPLETED");

                // Record platform income (2% platform fee) and credit farmer
                if (!orderRepository.isIncomeRecorded(id)) {
                    com.arpon007.agro.model.Order order = orderRepository.findById(id).orElse(null);
                    if (order != null) {
                        java.math.BigDecimal platformFee = order.getTotalAmount()
                                .multiply(new java.math.BigDecimal("0.02"));
                        orderRepository.recordPlatformIncome(id, platformFee, new java.math.BigDecimal("2.00"));

                        // Credit farmer wallet (Total - Platform Fee)
                        // Note: Depending on business logic, we credit the whole amount minus fee
                        // assuming the platform collected everything (Advance + COD/Digital).
                        java.math.BigDecimal amountToCredit = order.getTotalAmount().subtract(platformFee);
                        walletService.creditWallet(order.getFarmerId(), amountToCredit,
                                com.arpon007.agro.model.Transaction.TransactionSource.ORDER_PAYMENT,
                                "Payment for Order #" + id);
                    }
                }
            }

            return ResponseEntity.ok(Map.of("message", "Delivery status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update delivery status: " + e.getMessage()));
        }
    }

    /**
     * Get total platform income
     */
    @GetMapping("/income")
    public ResponseEntity<?> getIncome() {
        try {
            java.math.BigDecimal totalIncome = orderRepository.getTotalIncome();
            return ResponseEntity.ok(Map.of(
                    "totalIncome", totalIncome.toString(),
                    "currency", "BDT"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("totalIncome", "0", "currency", "BDT"));
        }
    }

    // ==================== STOCK MANAGEMENT ====================

    /**
     * Mark crop as stock out (sold out)
     */
    @PutMapping("/crops/{id}/stock-out")
    public ResponseEntity<?> markAsStockOut(@PathVariable Long id) {
        try {
            cropRepository.markAsSoldOut(id);
            return ResponseEntity.ok(Map.of("message", "Product marked as stock out"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update stock status: " + e.getMessage()));
        }
    }

    /**
     * Mark crop as back in stock (available)
     */
    @PutMapping("/crops/{id}/back-in-stock")
    public ResponseEntity<?> markAsBackInStock(@PathVariable Long id) {
        try {
            cropRepository.markAsAvailable(id);
            return ResponseEntity.ok(Map.of("message", "Product marked as back in stock"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update stock status: " + e.getMessage()));
        }
    }
}
