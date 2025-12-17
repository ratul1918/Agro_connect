package com.arpon007.agro.controller;

import com.arpon007.agro.model.MarketPrice;
import com.arpon007.agro.service.MarketPriceService;
import com.arpon007.agro.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market-prices")
public class MarketPriceController {

    private final MarketPriceService service;
    private final JwtUtil jwtUtil;

    public MarketPriceController(MarketPriceService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<List<MarketPrice>> getPrices(
            @RequestParam(required = false) String district,
            HttpServletRequest request) {
        boolean isBangla = true;
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String role = jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
                if ("ROLE_BUYER".equals(role) || "ROLE_AGRONOMIST".equals(role) || "ROLE_ADMIN".equals(role)) {
                    isBangla = false;
                }
            }
        } catch (Exception e) {
        }

        return ResponseEntity.ok(service.getPrices(district, isBangla));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> addPrice(@RequestBody MarketPrice price) {
        service.addPrice(price);
        return ResponseEntity.ok("Price added successfully");
    }
}
