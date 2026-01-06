package com.arpon007.agro.service;

import com.arpon007.agro.model.Order;
import com.arpon007.agro.repository.OrderRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);
    private final OrderRepository orderRepository;
    private final com.arpon007.agro.repository.UserRepository userRepository;
    private final com.arpon007.agro.repository.CropRepository cropRepository;
    private final org.springframework.core.io.ResourceLoader resourceLoader;
    private final String INVOICE_DIR = "invoices/";

    public InvoiceService(OrderRepository orderRepository,
            com.arpon007.agro.repository.UserRepository userRepository,
            com.arpon007.agro.repository.CropRepository cropRepository,
            org.springframework.core.io.ResourceLoader resourceLoader) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cropRepository = cropRepository;
        this.resourceLoader = resourceLoader;
        try {
            Files.createDirectories(Paths.get(INVOICE_DIR));
        } catch (IOException e) {
            log.error("Failed to create invoice directory {}", INVOICE_DIR, e);
        }
    }

    /**
     * Generate HTML Invoice String (Centralized Logic)
     */
    public String generateInvoiceHtml(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
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
            // Strictly check Retail to disable B2B features
            if (crop != null && crop.getMarketplaceType() == com.arpon007.agro.model.Crop.MarketplaceType.RETAIL) {
                isB2B = false;
            }

            String platformFeeSection = "";
            String advancePaymentSection = "";

            if (isB2B) {
                BigDecimal platformFee = order.getTotalAmount().multiply(new BigDecimal("0.01"));
                platformFeeSection = "<div class=\"totals-row\"><span>Platform Fee (1%)</span><span>৳"
                        + platformFee.setScale(2, java.math.RoundingMode.HALF_UP).toString() + "</span></div>";
                advancePaymentSection = "<div class=\"totals-row\" style=\"color: #ef4444;\"><span>Advance Payment (20%)</span><span>-৳"
                        + order.getAdvanceAmount().toString() + "</span></div>";
            } else {
                // Retail: No platform fee, No advance payment display
            }

            // Determine payment method - Retail = COD, B2B = Advance Payment
            String paymentMethod = isB2B ? "Advance Payment" : "Cash on Delivery";

            return template
                    .replace("{{customer_name}}", buyerName)
                    .replace("{{customer_email}}", buyerEmail)
                    .replace("{{customer_phone}}", buyerMobile)
                    .replace("{{customer_address}}", buyerAddress)
                    .replace("{{invoice_number}}", "INV-" + order.getId())
                    .replace("{{date}}", new SimpleDateFormat("dd MMM yyyy").format(new Date()))
                    .replace("{{order_id}}", String.valueOf(order.getId()))
                    .replace("{{payment_method}}", paymentMethod)
                    .replace("{{product_name}}", cropTitle)
                    .replace("{{farmer_name}}", farmerName)
                    .replace("{{quantity}}", "1") // Quantity handling placeholder
                    .replace("{{unit}}", "Unit")
                    .replace("{{price_per_unit}}", order.getTotalAmount().toString())
                    .replace("{{total_item_price}}", order.getTotalAmount().toString())
                    .replace("{{subtotal}}", order.getTotalAmount().toString())
                    .replace("{{platform_fee_section}}", platformFeeSection)
                    .replace("{{advance_payment_section}}", advancePaymentSection)
                    .replace("{{total_due}}", order.getDueAmount().toString());

        } catch (Exception e) {
            log.error("Error generating invoice HTML for order {}", orderId, e);
            throw new RuntimeException("Error generating invoice HTML: " + e.getMessage());
        }
    }

    /**
     * Generate PDF invoice using HTML-to-PDF conversion
     */
    public byte[] generateInvoicePDFBytes(Long orderId) {
        try {
            String htmlContent = generateInvoiceHtml(orderId);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            com.itextpdf.html2pdf.HtmlConverter.convertToPdf(htmlContent, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate invoice PDF bytes for order {}", orderId, e);
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
        }
    }

    // Kept for backward compatibility
    public String generateInvoicePDF(Long orderId) {
        return "";
    }
}
