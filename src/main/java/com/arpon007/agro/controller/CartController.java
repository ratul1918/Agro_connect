package com.arpon007.agro.controller;

import com.arpon007.agro.model.Cart;
import com.arpon007.agro.model.CartItem;
import com.arpon007.agro.model.Crop;
import com.arpon007.agro.repository.CartRepository;
import com.arpon007.agro.repository.CropRepository;
import com.arpon007.agro.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('GENERAL_CUSTOMER')")
public class CartController {

    private final CartRepository cartRepository;
    private final CropRepository cropRepository;

    public CartController(CartRepository cartRepository, CropRepository cropRepository) {
        this.cartRepository = cartRepository;
        this.cropRepository = cropRepository;
    }

    /**
     * Get customer's cart with all items
     */
    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Cart cart = cartRepository.getCartWithItems(userDetails.getId());
        return ResponseEntity.ok(cart);
    }

    /**
     * Add item to cart
     */
    @PostMapping("/items")
    public ResponseEntity<?> addItemToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            Long cropId = Long.valueOf(payload.get("cropId").toString());
            BigDecimal quantity = new BigDecimal(payload.get("quantity").toString());

            // Validate crop exists and is available
            Optional<Crop> cropOpt = cropRepository.findById(cropId);
            if (cropOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product not found"));
            }

            Crop crop = cropOpt.get();

            // Validate quantity is within retail limits
            if (quantity.compareTo(crop.getMinRetailQty()) < 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Minimum quantity is " + crop.getMinRetailQty() + " " + crop.getUnit()));
            }
            if (quantity.compareTo(crop.getMaxRetailQty()) > 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Maximum quantity is " + crop.getMaxRetailQty() + " " + crop.getUnit()));
            }

            // Check stock availability
            if (quantity.compareTo(crop.getQuantity()) > 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Only " + crop.getQuantity() + " " + crop.getUnit() + " available"));
            }

            Cart cart = cartRepository.getOrCreateCart(userDetails.getId());
            BigDecimal price = crop.getMinPrice();

            CartItem item = cartRepository.addItemToCart(cart.getId(), cropId, quantity, price);

            return ResponseEntity.ok(Map.of(
                    "message", "Item added to cart",
                    "item", item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to add item: " + e.getMessage()));
        }
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> payload) {
        try {
            BigDecimal quantity = new BigDecimal(payload.get("quantity").toString());

            // Get cart item
            CartItem item = cartRepository.getCartItemById(itemId);

            // Validate quantity against crop constraints
            Optional<Crop> cropOpt = cropRepository.findById(item.getCropId());
            if (cropOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product not found"));
            }

            Crop crop = cropOpt.get();
            if (quantity.compareTo(crop.getMinRetailQty()) < 0 || quantity.compareTo(crop.getMaxRetailQty()) > 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Quantity must be between " + crop.getMinRetailQty() +
                                " and " + crop.getMaxRetailQty() + " " + crop.getUnit()));
            }

            if (quantity.compareTo(crop.getQuantity()) > 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Only " + crop.getQuantity() + " " + crop.getUnit() + " available"));
            }

            cartRepository.updateCartItemQuantity(itemId, quantity);

            return ResponseEntity.ok(Map.of("message", "Cart updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update cart: " + e.getMessage()));
        }
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Long itemId) {
        try {
            cartRepository.removeCartItem(itemId);
            return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to remove item: " + e.getMessage()));
        }
    }

    /**
     * Clear entire cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Cart cart = cartRepository.getOrCreateCart(userDetails.getId());
            cartRepository.clearCart(cart.getId());
            return ResponseEntity.ok(Map.of("message", "Cart cleared"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to clear cart: " + e.getMessage()));
        }
    }
}
