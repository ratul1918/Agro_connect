package com.arpon007.agro.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
            crop.setRetailPrice(retailPrice);
            crop.setProfitMarginPercent(profitMarginPercent);
            crop.setFixedCostPerUnit(fixedCostPerUnit);
            crop.setLocation(location);

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
    public ResponseEntity<List<Crop>> getAllCrops(HttpServletRequest request) {
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

        List<Crop> crops = cropService.getAllCrops(isBangla);

        // Adjust prices based on user role
        for (Crop crop : crops) {
            adjustPriceForRole(crop, userRole);
        }

        return ResponseEntity.ok(crops);
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
            // Wholesale pricing for buyers
            pricing.put("priceType", "WHOLESALE");
            pricing.put("price", crop.getWholesalePrice() != null ? crop.getWholesalePrice() : crop.getMinPrice());
            pricing.put("minQuantity",
                    crop.getMinWholesaleQty() != null ? crop.getMinWholesaleQty() : new BigDecimal("80"));
            pricing.put("maxQuantity", crop.getQuantity());
            pricing.put("unit", crop.getUnit());
            pricing.put("message", "Minimum order: "
                    + (crop.getMinWholesaleQty() != null ? crop.getMinWholesaleQty() : "80") + " " + crop.getUnit());
        } else {
            // Retail pricing for general customers
            pricing.put("priceType", "RETAIL");
            pricing.put("price", crop.getCalculatedRetailPrice());
            pricing.put("minQuantity", crop.getMinRetailQty() != null ? crop.getMinRetailQty() : new BigDecimal("0.1"));
            pricing.put("maxQuantity", crop.getMaxRetailQty() != null ? crop.getMaxRetailQty() : new BigDecimal("10"));
            pricing.put("unit", crop.getUnit());
            pricing.put("message", "Order between " + (crop.getMinRetailQty() != null ? crop.getMinRetailQty() : "0.1")
                    + " - " + (crop.getMaxRetailQty() != null ? crop.getMaxRetailQty() : "10") + " " + crop.getUnit());
        }

        return ResponseEntity.ok(pricing);
    }

    /**
     * Adjust crop price based on user role
     * BUYER sees wholesale price, others see retail price
     */
    private void adjustPriceForRole(Crop crop, String userRole) {
        if ("ROLE_BUYER".equals(userRole)) {
            // Buyers see wholesale price
            if (crop.getWholesalePrice() != null) {
                crop.setMinPrice(crop.getWholesalePrice());
            }
            // Set minimum quantity for wholesale
            if (crop.getMinWholesaleQty() == null) {
                crop.setMinWholesaleQty(new BigDecimal("80"));
            }
        } else {
            // General customers and guests see retail price
            BigDecimal retailPrice = crop.getCalculatedRetailPrice();
            crop.setMinPrice(retailPrice);
            // Set quantity limits for retail
            if (crop.getMinRetailQty() == null) {
                crop.setMinRetailQty(new BigDecimal("0.1"));
            }
            if (crop.getMaxRetailQty() == null) {
                crop.setMaxRetailQty(new BigDecimal("10"));
            }
        }
    }
}
