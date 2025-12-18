package com.arpon007.agro.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.arpon007.agro.model.Crop;
import com.arpon007.agro.security.JwtUtil;
import com.arpon007.agro.service.CropService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final CropService cropService;
    private final JwtUtil jwtUtil;

    public CropController(CropService cropService, JwtUtil jwtUtil) {
        this.cropService = cropService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<Crop> addCrop(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("cropTypeId") Integer cropTypeId,
            @RequestParam("quantity") BigDecimal quantity,
            @RequestParam("unit") String unit,
            @RequestParam("minPrice") BigDecimal minPrice,
            @RequestParam(value = "wholesalePrice", required = false) BigDecimal wholesalePrice,
            @RequestParam(value = "minWholesaleQty", required = false) BigDecimal minWholesaleQty,
            @RequestParam(value = "retailPrice", required = false) BigDecimal retailPrice,
            @RequestParam(value = "profitMarginPercent", required = false) BigDecimal profitMarginPercent,
            @RequestParam(value = "fixedCostPerUnit", required = false) BigDecimal fixedCostPerUnit,
            @RequestParam("location") String location,
            @RequestParam(value = "marketType", required = false) String marketType,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            HttpServletRequest request) throws IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).build();
            }

            String token = authHeader.substring(7);
            // Fix: Safely extract userId which might be Integer or Long in JWT
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("userId");
                if (idObj == null)
                    return null; // Handle missing claim
                if (idObj instanceof Integer) {
                    return ((Integer) idObj).longValue();
                } else if (idObj instanceof Long) {
                    return (Long) idObj;
                } else {
                    return Long.parseLong(String.valueOf(idObj));
                }
            });

            if (userId == null) {
                // If token doesn't have userId (e.g., old token), force re-login
                return ResponseEntity.status(401).build();
            }

            Crop crop = new Crop();
            crop.setFarmerId(userId);
            crop.setTitle(title);
            crop.setDescription(description);
            crop.setCropTypeId(cropTypeId);
            crop.setQuantity(quantity);
            crop.setUnit(unit);
            crop.setMinPrice(minPrice);
            crop.setWholesalePrice(wholesalePrice);
            crop.setMinWholesaleQty(minWholesaleQty);
            crop.setRetailPrice(retailPrice);
            crop.setProfitMarginPercent(profitMarginPercent);
            crop.setFixedCostPerUnit(fixedCostPerUnit);
            crop.setLocation(location);

            // Set marketplace type - B2B or RETAIL
            if (marketType != null && !marketType.isEmpty()) {
                crop.setMarketplaceType(Crop.MarketplaceType.valueOf(marketType.toUpperCase()));
            } else {
                // Default based on role
                String userRole = jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
                if ("ROLE_FARMER".equals(userRole)) {
                    crop.setMarketplaceType(Crop.MarketplaceType.B2B);
                } else {
                    crop.setMarketplaceType(Crop.MarketplaceType.RETAIL);
                }
            }

            return ResponseEntity.ok(cropService.addCrop(crop, images));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<Crop> updateCrop(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("cropTypeId") Integer cropTypeId,
            @RequestParam("quantity") BigDecimal quantity,
            @RequestParam("unit") String unit,
            @RequestParam("minPrice") BigDecimal minPrice,
            @RequestParam(value = "wholesalePrice", required = false) BigDecimal wholesalePrice,
            @RequestParam(value = "retailPrice", required = false) BigDecimal retailPrice,
            @RequestParam(value = "profitMarginPercent", required = false) BigDecimal profitMarginPercent,
            @RequestParam(value = "fixedCostPerUnit", required = false) BigDecimal fixedCostPerUnit,
            @RequestParam("location") String location,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            HttpServletRequest request) throws IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).build();
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("userId");
                if (idObj == null)
                    return null;
                if (idObj instanceof Integer) {
                    return ((Integer) idObj).longValue();
                } else if (idObj instanceof Long) {
                    return (Long) idObj;
                } else {
                    return Long.parseLong(String.valueOf(idObj));
                }
            });

            if (userId == null) {
                return ResponseEntity.status(401).build();
            }

            // Get existing crop to verify ownership
            Crop existingCrop = cropService.getCropById(id, false);
            if (existingCrop == null) {
                return ResponseEntity.notFound().build();
            }

            // Update crop fields
            existingCrop.setTitle(title);
            existingCrop.setDescription(description);
            existingCrop.setCropTypeId(cropTypeId);
            existingCrop.setQuantity(quantity);
            existingCrop.setUnit(unit);
            existingCrop.setMinPrice(minPrice);
            existingCrop.setWholesalePrice(wholesalePrice);
            existingCrop.setRetailPrice(retailPrice);
            existingCrop.setProfitMarginPercent(profitMarginPercent);
            existingCrop.setFixedCostPerUnit(fixedCostPerUnit);
            existingCrop.setLocation(location);

            return ResponseEntity.ok(cropService.updateCrop(existingCrop, images));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<Crop>> getAllCrops(
            @RequestParam(value = "marketplaceType", required = false) String marketplaceType,
            HttpServletRequest request) {
        boolean isBangla = true;
        String userRole = null;

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                userRole = jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
                if ("ROLE_BUYER".equals(userRole) || "ROLE_AGRONOMIST".equals(userRole)
                        || "ROLE_ADMIN".equals(userRole)) {
                    isBangla = false;
                }
            }
        } catch (Exception e) {
            // Guest or error, default Bangla
        }

        List<Crop> crops;

        // If explicit marketplaceType is provided, use it
        if (marketplaceType != null && !marketplaceType.isEmpty()) {
            crops = cropService.getCropsByMarketplaceType(marketplaceType.toUpperCase(), isBangla);
        } else {
            // Fallback to role-based filtering
            if ("ROLE_BUYER".equals(userRole)) {
                crops = cropService.getCropsByMarketplaceType("B2B", isBangla);
            } else {
                crops = cropService.getCropsByMarketplaceType("RETAIL", isBangla);
            }
        }

        // Adjust prices based on user role
        for (Crop crop : crops) {
            adjustPriceForRole(crop, userRole);
        }

        return ResponseEntity.ok(crops);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<Crop>> getMyCrops(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).build();
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("userId");
                if (idObj == null)
                    return null;
                if (idObj instanceof Integer) {
                    return ((Integer) idObj).longValue();
                } else if (idObj instanceof Long) {
                    return (Long) idObj;
                } else {
                    return Long.parseLong(String.valueOf(idObj));
                }
            });

            if (userId == null) {
                return ResponseEntity.status(401).build();
            }

            return ResponseEntity.ok(cropService.getCropsByFarmerId(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Crop> getCrop(@PathVariable Long id, HttpServletRequest request) {
        boolean isBangla = true;
        String userRole = null;

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                userRole = jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
                if ("ROLE_BUYER".equals(userRole) || "ROLE_AGRONOMIST".equals(userRole)
                        || "ROLE_ADMIN".equals(userRole)) {
                    isBangla = false;
                }
            }
        } catch (Exception e) {
            // Guest or error
        }

        Crop crop = cropService.getCropById(id, isBangla);
        adjustPriceForRole(crop, userRole);

        return ResponseEntity.ok(crop);
    }

    /**
     * Get pricing info for a crop based on user role
     * This endpoint returns pricing rules for the frontend
     */
    @GetMapping("/{id}/pricing")
    public ResponseEntity<Map<String, Object>> getCropPricing(@PathVariable Long id, HttpServletRequest request) {
        String userRole = null;

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                userRole = jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
            }
        } catch (Exception e) {
            // Guest user
        }

        Crop crop = cropService.getCropById(id, true);
        Map<String, Object> pricing = new HashMap<>();

        if ("ROLE_BUYER".equals(userRole)) {
            // Wholesale pricing for buyers - use exact price set
            pricing.put("priceType", "WHOLESALE");
            pricing.put("price", crop.getMinPrice());
            pricing.put("minQuantity", crop.getMinWholesaleQty());
            pricing.put("maxQuantity", crop.getQuantity());
            pricing.put("unit", crop.getUnit());
            pricing.put("message", "Wholesale price: ৳" + crop.getMinPrice() + "/" + crop.getUnit());
        } else {
            // Retail pricing for general customers - use exact price set
            pricing.put("priceType", "RETAIL");
            pricing.put("price", crop.getMinPrice());
            pricing.put("minQuantity", crop.getMinRetailQty());
            pricing.put("maxQuantity", crop.getMaxRetailQty());
            pricing.put("unit", crop.getUnit());
            pricing.put("message", "Retail price: ৳" + crop.getMinPrice() + "/" + crop.getUnit());
        }

        return ResponseEntity.ok(pricing);
    }

    /**
     * No price adjustment - show exact price entered
     */
    private void adjustPriceForRole(Crop crop, String userRole) {
        // No adjustments - show exact price as entered
    }

    /**
     * Mark crop as stock out (sold out) - for farmers
     */
    @PutMapping("/{id}/stock-out")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<?> markStockOut(@PathVariable Long id) {
        try {
            cropService.markAsSold(id);
            return ResponseEntity.ok(Map.of("message", "Product marked as stock out"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update stock status: " + e.getMessage()));
        }
    }

    /**
     * Mark crop as back in stock (available) - for farmers
     */
    @PutMapping("/{id}/back-in-stock")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<?> markBackInStock(@PathVariable Long id) {
        try {
            cropService.markAsAvailable(id);
            return ResponseEntity.ok(Map.of("message", "Product marked as back in stock"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update stock status: " + e.getMessage()));
        }
    }

    /**
     * Delete a crop - for farmers/admin
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<?> deleteCrop(@PathVariable Long id) {
        try {
            cropService.deleteCrop(id);
            return ResponseEntity.ok(Map.of("message", "Crop deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to delete crop: " + e.getMessage()));
        }
    }
}
