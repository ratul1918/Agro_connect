package com.arpon007.agro.controller;

import com.arpon007.agro.model.Order;
import com.arpon007.agro.repository.OrderRepository;
import com.arpon007.agro.security.JwtUtil;
import com.arpon007.agro.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final JwtUtil jwtUtil;
    private final WalletService walletService;
    private final ResourceLoader resourceLoader;
    private final com.arpon007.agro.repository.UserRepository userRepository;
    private final com.arpon007.agro.repository.CropRepository cropRepository;
    private final com.arpon007.agro.service.InvoiceService invoiceService;

    public OrderController(OrderRepository orderRepository, JwtUtil jwtUtil, WalletService walletService,
            ResourceLoader resourceLoader,
            com.arpon007.agro.repository.UserRepository userRepository,
            com.arpon007.agro.repository.CropRepository cropRepository,
            com.arpon007.agro.service.InvoiceService invoiceService) {
        this.orderRepository = orderRepository;
        this.jwtUtil = jwtUtil;
        this.walletService = walletService;
        this.resourceLoader = resourceLoader;
        this.userRepository = userRepository;
        this.cropRepository = cropRepository;
        this.invoiceService = invoiceService;
    }

    @GetMapping(value = "/{id}/invoice", produces = "text/html")
    public ResponseEntity<String> getInvoice(@PathVariable Long id) {
        try {
            Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            com.arpon007.agro.model.User buyer = userRepository.findById(order.getBuyerId()).orElse(null);
            com.arpon007.agro.model.User farmer = userRepository.findById(order.getFarmerId()).orElse(null);
            com.arpon007.agro.model.Crop crop = cropRepository.findById(order.getCropId()).orElse(null);

            org.springframework.core.io.Resource resource = resourceLoader
                    .getResource("classpath:templates/email/invoice.html");
            String template = org.springframework.util.StreamUtils.copyToString(resource.getInputStream(),
                    java.nio.charset.StandardCharsets.UTF_8);

            String buyerName = buyer != null ? buyer.getFullName() : "Buyer #" + order.getBuyerId();
            String buyerEmail = buyer != null ? buyer.getEmail() : "N/A";
            String buyerMobile = order.getCustomerMobile() != null ? order.getCustomerMobile()
                    : (buyer != null ? buyer.getPhone() : "N/A");
            String buyerAddress = order.getCustomerAddress() != null ? order.getCustomerAddress() : "N/A";

            String farmerName = farmer != null ? farmer.getFullName() : "Farmer #" + order.getFarmerId();
            String cropTitle = crop != null ? crop.getTitle() : "Crop #" + order.getCropId();

            // Determine if B2B logic applies
            boolean isB2B = crop != null
                    && (crop.getMarketplaceType() == com.arpon007.agro.model.Crop.MarketplaceType.B2B
                            || crop.getMarketplaceType() == com.arpon007.agro.model.Crop.MarketplaceType.BOTH);
            // Default to B2B if unsure, or strictly check Retail
            if (crop != null && crop.getMarketplaceType() == com.arpon007.agro.model.Crop.MarketplaceType.RETAIL) {
                isB2B = false;
            }

            String platformFeeSection = "";
            String advancePaymentSection = "";

            if (isB2B) {
                BigDecimal platformFee = order.getTotalAmount().multiply(new BigDecimal("0.01"));
                platformFeeSection = "<div class=\"totals-row\"><span>Platform Fee (1%)</span><span>৳"
                        + platformFee.setScale(2, java.math.RoundingMode.HALF_UP).toString() + "</span></div>";
                advancePaymentSection = "<div class=\"totals-row\" style=\"color: #ef4444;\"><span>Advance Payment Note:</span><span>-৳"
                        + order.getAdvanceAmount().toString() + "</span></div>";
            } else {
                // Retail: No platform fee, No advance payment display (handled in Due usually,
                // ensuring clarity)
                // If Retail, Total Amount is typically the Due Amount if not paid?
                // For now, hiding advance section as requested.
            }

            String html = template
                    .replace("{{customer_name}}", buyerName)
                    .replace("{{customer_email}}", buyerEmail)
                    .replace("{{customer_phone}}", buyerMobile)
                    .replace("{{customer_address}}", buyerAddress)
                    .replace("{{invoice_number}}", "INV-" + order.getId())
                    .replace("{{date}}", new java.text.SimpleDateFormat("dd MMM yyyy").format(new java.util.Date()))
                    .replace("{{order_id}}", String.valueOf(order.getId()))
                    .replace("{{product_name}}", cropTitle)
                    .replace("{{farmer_name}}", farmerName)
                    .replace("{{quantity}}", "1") // Quantity handling to be improved later
                    .replace("{{unit}}", "Unit")
                    .replace("{{price_per_unit}}", order.getTotalAmount().toString())
                    .replace("{{total_item_price}}", order.getTotalAmount().toString())
                    .replace("{{subtotal}}", order.getTotalAmount().toString())
                    .replace("{{platform_fee_section}}", platformFeeSection)
                    .replace("{{advance_payment_section}}", advancePaymentSection)
                    .replace("{{total_due}}", order.getDueAmount().toString());

            return ResponseEntity.ok(html);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating invoice: " + e.getMessage());
        }
    }

    @GetMapping(value = "/{id}/invoice/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> getInvoicePDF(@PathVariable Long id) {
        try {
            byte[] pdfBytes = invoiceService.generateInvoicePDFBytes(id);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=invoice-" + id + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<String> createOrder(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long buyerId = jwtUtil.extractClaim(token, claims -> claims.get("userId", Long.class));

        Long farmerId = Long.valueOf(payload.get("farmerId").toString());
        Long cropId = Long.valueOf(payload.get("cropId").toString());
        BigDecimal totalAmount = new BigDecimal(payload.get("totalAmount").toString());

        // 20% Advance logic
        BigDecimal advance = totalAmount.multiply(new BigDecimal("0.20"));
        BigDecimal due = totalAmount.subtract(advance);

        // Check and debit wallet first
        try {
            walletService.debitWallet(buyerId, advance,
                    com.arpon007.agro.model.Transaction.TransactionSource.ORDER_PAYMENT,
                    "Advance for Order (" + cropId + ")");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Payment failed: " + e.getMessage());
        }

        Order order = new Order();
        order.setBuyerId(buyerId);
        order.setFarmerId(farmerId);
        order.setCropId(cropId);
        order.setTotalAmount(totalAmount);
        order.setAdvanceAmount(advance);
        order.setDueAmount(due);
        order.setStatus(com.arpon007.agro.model.Order.OrderStatus.PENDING); // Ensure status is set

        Long orderId = orderRepository.createOrder(order);

        return ResponseEntity.ok("Order placed successfully. ID: " + orderId);
    }
}
