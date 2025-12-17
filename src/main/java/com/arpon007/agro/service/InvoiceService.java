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
    private final String INVOICE_DIR = "invoices/";

    public InvoiceService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
        try {
            Files.createDirectories(Paths.get(INVOICE_DIR));
        } catch (IOException e) {
            log.error("Failed to create invoice directory {}", INVOICE_DIR, e);
        }
    }

    /**
     * Generate PDF invoice for an order and save it
     */
    public String generateInvoicePDF(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            String fileName = "INV-" + orderId + "-" + System.currentTimeMillis() + ".pdf";
            String filePath = INVOICE_DIR + fileName;

            // Create PDF
            PdfWriter writer = new PdfWriter(new FileOutputStream(filePath));
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header
            Paragraph header = new Paragraph("INVOICE")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            // Company info
            document.add(new Paragraph("Agro Connect")
                    .setFontSize(16)
                    .setBold());
            document.add(new Paragraph("Smart Agriculture Marketplace")
                    .setFontSize(10));
            document.add(new Paragraph("Dhaka, Bangladesh")
                    .setFontSize(10));
            document.add(new Paragraph(" ")); // Spacer

            // Invoice details
            String invoiceNumber = "INV-" + orderId;
            String date = new SimpleDateFormat("dd MMM yyyy").format(new Date());

            Table infoTable = new Table(2);
            infoTable.addCell("Invoice Number:");
            infoTable.addCell(invoiceNumber);
            infoTable.addCell("Date:");
            infoTable.addCell(date);
            infoTable.addCell("Order ID:");
            infoTable.addCell(String.valueOf(orderId));
            infoTable.addCell("Buyer ID:");
            infoTable.addCell(String.valueOf(order.getBuyerId()));
            infoTable.addCell("Farmer ID:");
            infoTable.addCell(String.valueOf(order.getFarmerId()));
            document.add(infoTable);

            document.add(new Paragraph(" ")); // Spacer

            // Order details table
            Table orderTable = new Table(4);
            orderTable.addHeaderCell("Product ID");
            orderTable.addHeaderCell("Quantity");
            orderTable.addHeaderCell("Unit Price");
            orderTable.addHeaderCell("Total");

            orderTable.addCell(String.valueOf(order.getCropId()));
            orderTable.addCell("1"); // TODO: Get actual quantity from order
            orderTable.addCell("৳" + order.getTotalAmount().toString());
            orderTable.addCell("৳" + order.getTotalAmount().toString());

            document.add(orderTable);

            document.add(new Paragraph(" ")); // Spacer

            // Payment summary
            Table summaryTable = new Table(2);
            summaryTable.addCell("Subtotal:");
            summaryTable.addCell("৳" + order.getTotalAmount().toString());

            BigDecimal platformFee = order.getTotalAmount().multiply(new BigDecimal("0.02"));
            summaryTable.addCell("Platform Fee (2%):");
            summaryTable.addCell("৳" + platformFee.setScale(2, java.math.RoundingMode.HALF_UP).toString());

            summaryTable.addCell("Advance Payment:");
            summaryTable.addCell("৳" + order.getAdvanceAmount().toString());

            summaryTable.addCell(new Paragraph("Amount Due:").setBold());
            summaryTable.addCell(new Paragraph("৳" + order.getDueAmount().toString()).setBold());

            document.add(summaryTable);

            document.add(new Paragraph(" ")); // Spacer

            // Footer
            document.add(new Paragraph("Thank you for your business!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(12)
                    .setItalic());

            document.close();

            log.info("Invoice PDF generated successfully: {}", filePath);
            return "/" + filePath; // Return relative path for storage/access

        } catch (Exception e) {
            log.error("Failed to generate invoice PDF for order {}", orderId, e);
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
        }
    }

    /**
     * Generate PDF invoice and return as byte array for download
     */
    public byte[] generateInvoicePDFBytes(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Same PDF content generation as above
            document.add(new Paragraph("INVOICE")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Agro Connect").setFontSize(16).setBold());
            document.add(new Paragraph("Invoice #INV-" + orderId));
            document.add(new Paragraph("Date: " + new SimpleDateFormat("dd MMM yyyy").format(new Date())));
            document.add(new Paragraph(" "));

            Table detailsTable = new Table(2);
            detailsTable.addCell("Order ID:");
            detailsTable.addCell(String.valueOf(orderId));
            detailsTable.addCell("Total Amount:");
            detailsTable.addCell("৳" + order.getTotalAmount().toString());
            detailsTable.addCell("Advance Paid:");
            detailsTable.addCell("৳" + order.getAdvanceAmount().toString());
            detailsTable.addCell("Due Amount:");
            detailsTable.addCell("৳" + order.getDueAmount().toString());
            document.add(detailsTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Thank you for your business!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate invoice PDF bytes for order {}", orderId, e);
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
        }
    }
}
