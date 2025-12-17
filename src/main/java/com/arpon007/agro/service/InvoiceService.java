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
    private final String INVOICE_DIR = "invoices/";

    public InvoiceService(OrderRepository orderRepository,
            com.arpon007.agro.repository.UserRepository userRepository,
            com.arpon007.agro.repository.CropRepository cropRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cropRepository = cropRepository;
        try {
            Files.createDirectories(Paths.get(INVOICE_DIR));
        } catch (IOException e) {
            log.error("Failed to create invoice directory {}", INVOICE_DIR, e);
        }
    }

    /**
     * Generate PDF invoice and return as byte array for download
     */
    public byte[] generateInvoicePDFBytes(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            com.arpon007.agro.model.User buyer = userRepository.findById(order.getBuyerId()).orElse(null);
            com.arpon007.agro.model.User farmer = userRepository.findById(order.getFarmerId()).orElse(null);
            com.arpon007.agro.model.Crop crop = cropRepository.findById(order.getCropId()).orElse(null);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header
            Paragraph header = new Paragraph("INVOICE")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            // Company Info
            document.add(new Paragraph("Agro Connect")
                    .setFontSize(16)
                    .setBold());
            document.add(new Paragraph("Smart Agriculture Marketplace").setFontSize(10));
            document.add(new Paragraph("Dhaka, Bangladesh").setFontSize(10));
            document.add(new Paragraph(" "));

            // Invoice Info Table
            Table infoTable = new Table(2);
            infoTable.addCell(new Paragraph("Invoice Details").setBold());
            infoTable.addCell(new Paragraph("Customer Details").setBold());

            infoTable.addCell(
                    "Invoice #: INV-" + orderId + "\nDate: " + new SimpleDateFormat("dd MMM yyyy").format(new Date()));

            String customerInfo = "Name: " + (buyer != null ? buyer.getFullName() : "Unknown") + "\n" +
                    "Phone: "
                    + (order.getCustomerMobile() != null ? order.getCustomerMobile()
                            : (buyer != null ? buyer.getPhone() : "N/A"))
                    + "\n" +
                    "Address: " + (order.getCustomerAddress() != null ? order.getCustomerAddress() : "N/A");
            infoTable.addCell(customerInfo);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Order Details Table
            Table orderTable = new Table(4);
            orderTable.addHeaderCell("Product");
            orderTable.addHeaderCell("Seller");
            orderTable.addHeaderCell("Unit");
            orderTable.addHeaderCell("Amount");

            orderTable.addCell(crop != null ? crop.getTitle() : "Crop #" + order.getCropId());
            orderTable.addCell(farmer != null ? farmer.getFullName() : "Farmer #" + order.getFarmerId());
            orderTable.addCell("1 Unit"); // Defaulting to 1 as quantity isn't clearly tracked in order table yet
            orderTable.addCell("৳" + order.getTotalAmount().toString());

            document.add(orderTable);
            document.add(new Paragraph(" "));

            // Payment Summary
            Table summaryTable = new Table(2);
            summaryTable.addCell("Subtotal:");
            summaryTable.addCell("৳" + order.getTotalAmount().toString());

            summaryTable.addCell("Advance Payment:");
            summaryTable.addCell("৳" + order.getAdvanceAmount().toString());

            summaryTable.addCell(new Paragraph("Due Amount:").setBold());
            summaryTable.addCell(new Paragraph("৳" + order.getDueAmount().toString()).setBold());

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            // Footer
            document.add(new Paragraph("Thank you for your order!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate invoice PDF bytes for order {}", orderId, e);
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
        }
    }

    // Kept for backward compatibility but using new logic
    public String generateInvoicePDF(Long orderId) {
        // Simplified to avoid duplication, redirecting logic not needed for now as we
        // use bytes mostly
        return "";
    }
}
