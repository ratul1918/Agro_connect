package com.arpon007.agro.controller;

import com.arpon007.agro.model.Cart;
import com.arpon007.agro.model.CartItem;
import com.arpon007.agro.model.Crop;
import com.arpon007.agro.model.Order;
import com.arpon007.agro.repository.CartRepository;
import com.arpon007.agro.repository.CropRepository;
import com.arpon007.agro.repository.OrderRepository;
import com.arpon007.agro.security.CustomUserDetails;
import com.arpon007.agro.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/orders")
@PreAuthorize("hasAnyRole('GENERAL_CUSTOMER', 'CUSTOMER', 'BUYER', 'FARMER', 'ADMIN')")
public class CustomerOrderController {

    private final CartRepository cartRepository;
    private final CropRepository cropRepository;
    private final OrderRepository orderRepository;
    private final WalletService walletService;
    private final com.arpon007.agro.repository.AppConfigRepository appConfigRepository;

    public CustomerOrderController(CartRepository cartRepository, CropRepository cropRepository,
            OrderRepository orderRepository, WalletService walletService,
            com.arpon007.agro.repository.AppConfigRepository appConfigRepository) {
        this.cartRepository = cartRepository;
        this.cropRepository = cropRepository;
        this.orderRepository = orderRepository;
        this.walletService = walletService;
        this.appConfigRepository = appConfigRepository;
    }

    /**
     * Checkout - Create order from cart
     */
    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        try {
            String mobile = payload.get("mobile").toString();
            String address = payload.get("address").toString();
            String paymentMethod = payload.get("paymentMethod").toString(); // BKASH, BANK, CASH
            String deliveryLocation = payload.getOrDefault("deliveryLocation", "dhaka").toString();

            // Get cart with items
            Cart cart = cartRepository.getCartWithItems(userDetails.getId());

            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cart is empty"));
            }

            // Calculate total and create orders for each crop
            BigDecimal grandTotal = BigDecimal.ZERO;
            List<Long> orderIds = new ArrayList<>();

            for (CartItem item : cart.getItems()) {
                // Get crop details
                Crop crop = cropRepository.findById(item.getCropId()).orElseThrow();

                // Validate stock
                if (item.getQuantity().compareTo(crop.getQuantity()) > 0) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Insufficient stock for " + crop.getTitle()));
                }

                // Calculate item total - use exact price set by farmer
                BigDecimal price = crop.getMinPrice();
                BigDecimal itemTotal = price.multiply(item.getQuantity());
                grandTotal = grandTotal.add(itemTotal);

                // Create order - for customers, full payment upfront (no advance/due split)
                Order order = new Order();
                order.setBuyerId(userDetails.getId());
                order.setFarmerId(crop.getFarmerId());
                order.setCropId(crop.getId());
                order.setTotalAmount(itemTotal);
                order.setAdvanceAmount(itemTotal); // Full payment
                order.setDueAmount(BigDecimal.ZERO);
                order.setCustomerMobile(mobile);
                order.setCustomerAddress(address);
                order.setStatus(Order.OrderStatus.PENDING);
                order.setDeliveryStatus(Order.DeliveryStatus.PENDING);

                Long orderId = orderRepository.createOrder(order);
                orderIds.add(orderId);

                // Reduce stock
                BigDecimal newQuantity = crop.getQuantity().subtract(item.getQuantity());
                cropRepository.updateStock(crop.getId(), newQuantity);
            }

            // Add Delivery Charge
            String configKey = "delivery_charge_" + deliveryLocation; // delivery_charge_dhaka or
                                                                      // delivery_charge_outside
            String defaultCharge = "dhaka".equalsIgnoreCase(deliveryLocation) ? "70" : "130";
            BigDecimal deliveryFee = new BigDecimal(appConfigRepository.getValue(configKey, defaultCharge));

            grandTotal = grandTotal.add(deliveryFee);

            // Debit wallet - ONLY if using Wallet/Online payment
            if ("WALLET".equalsIgnoreCase(paymentMethod) || "ONLINE".equalsIgnoreCase(paymentMethod)) {
                try {
                    walletService.debitWallet(
                            userDetails.getId(),
                            grandTotal,
                            com.arpon007.agro.model.Transaction.TransactionSource.ORDER_PAYMENT,
                            "Payment for " + orderIds.size() + " order(s) + Delivery Fee");
                } catch (IllegalArgumentException e) {
                    // Rollback will happen automatically due to @Transactional
                    return ResponseEntity.badRequest().body(Map.of("message", "Payment failed: " + e.getMessage()));
                }
            } else {
                // For COD/Cash, we don't debit wallet.
                // Assuming success for now.
            }

            // Clear cart after successful checkout
            cartRepository.clearCart(cart.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Order placed successfully",
                    "orderIds", orderIds,
                    "totalAmount", grandTotal.toString(),
                    "deliveryFee", deliveryFee,
                    "paymentMethod", paymentMethod));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Checkout failed: " + e.getMessage()));
        }
    }

    /**
     * Get customer's order history
     */
    @GetMapping
    public ResponseEntity<?> getOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<Order> orders = orderRepository.findByCustomerId(userDetails.getId());

            // Enrich orders with crop details
            List<Map<String, Object>> enrichedOrders = new ArrayList<>();
            for (Order order : orders) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("totalAmount", order.getTotalAmount());
                orderMap.put("status", order.getStatus().name());
                orderMap.put("deliveryStatus",
                        order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "PENDING");
                orderMap.put("customerMobile", order.getCustomerMobile());
                orderMap.put("customerAddress", order.getCustomerAddress());
                orderMap.put("createdAt", order.getCreatedAt());

                // Get crop details
                cropRepository.findById(order.getCropId()).ifPresent(crop -> {
                    orderMap.put("cropTitle", crop.getTitle());
                    orderMap.put("cropImage", crop.getImages() != null && !crop.getImages().isEmpty()
                            ? crop.getImages().get(0)
                            : null);
                });

                enrichedOrders.add(orderMap);
            }

            return ResponseEntity.ok(enrichedOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    /**
     * Get specific order details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            Order order = orderRepository.findById(id).orElseThrow();

            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", order.getId());
            orderMap.put("totalAmount", order.getTotalAmount());
            orderMap.put("status", order.getStatus().name());
            orderMap.put("deliveryStatus",
                    order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : "PENDING");
            orderMap.put("customerMobile", order.getCustomerMobile());
            orderMap.put("customerAddress", order.getCustomerAddress());
            orderMap.put("createdAt", order.getCreatedAt());

            // Get crop details
            cropRepository.findById(order.getCropId()).ifPresent(crop -> {
                orderMap.put("cropTitle", crop.getTitle());
                orderMap.put("cropImage", crop.getImages() != null && !crop.getImages().isEmpty()
                        ? crop.getImages().get(0)
                        : null);
                orderMap.put("farmerName", crop.getFarmerName());
            });

            return ResponseEntity.ok(orderMap);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
