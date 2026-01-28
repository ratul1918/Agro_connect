package com.arpon007.agro.controller;

import com.arpon007.agro.model.Crop;
import com.arpon007.agro.model.Order;
import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.CropRepository;
import com.arpon007.agro.repository.OrderRepository;
import com.arpon007.agro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    private static final Logger log = LoggerFactory.getLogger(ShopController.class);

    @Autowired
    private CropRepository cropRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.arpon007.agro.service.InvoiceService invoiceService;

    @GetMapping("/products")
    public List<Crop> getProducts() {
        return cropRepository.findAllRetail();
    }

    @GetMapping("/crop-types")
    public ResponseEntity<?> getCropTypes() {
        try {
            return ResponseEntity.ok(cropRepository.getAllCropTypes());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage(), "trace", e.getStackTrace()[0].toString()));
        }
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Crop> getProduct(@PathVariable Long id) {
        return cropRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        try {
            Long cropId = Long.valueOf(payload.get("cropId").toString());
            BigDecimal quantity = new BigDecimal(payload.get("quantity").toString());

            Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
            if (userOpt.isEmpty())
                return ResponseEntity.badRequest().body("User not found");
            User buyer = userOpt.get();

            Optional<Crop> cropOpt = cropRepository.findById(cropId);
            if (cropOpt.isEmpty())
                return ResponseEntity.badRequest().body("Crop not found");
            Crop crop = cropOpt.get();

            if (crop.getQuantity().compareTo(quantity) < 0) {
                return ResponseEntity.badRequest().body("Not enough stock");
            }

            // Calculate Amount - use exact price set by farmer
            BigDecimal price = crop.getMinPrice();
            if (price == null) {
                return ResponseEntity.badRequest().body("Price not available");
            }
            BigDecimal totalAmount = price.multiply(quantity);

            Order order = new Order();
            order.setBuyerId(buyer.getId());
            order.setFarmerId(crop.getFarmerId());
            order.setCropId(crop.getId());
            order.setTotalAmount(totalAmount);
            order.setAdvanceAmount(BigDecimal.ZERO); // COD
            order.setDueAmount(totalAmount);
            order.setCreatedAt(new Timestamp(System.currentTimeMillis()));

            // Save Order
            Long orderId = orderRepository.createOrder(order);
            orderRepository.updateStatus(orderId, "PENDING_DELIVERY");

            // Update Stock
            cropRepository.updateStock(cropId, crop.getQuantity().subtract(quantity));

            // Generate invoice PDF automatically
            try {
                String invoicePath = invoiceService.generateInvoicePDF(orderId);
                log.info("Invoice generated for order {}: {}", orderId, invoicePath);
            } catch (Exception invoiceEx) {
                log.error("Failed to generate invoice for order {}", orderId, invoiceEx);
                // Don't fail the order if invoice generation fails
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Order placed successfully",
                    "orderId", orderId,
                    "invoiceUrl", "/api/orders/" + orderId + "/invoice/pdf"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error processing order: " + e.getMessage());
        }
    }
}
