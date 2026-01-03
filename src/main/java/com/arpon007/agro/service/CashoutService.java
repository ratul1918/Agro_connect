package com.arpon007.agro.service;

import com.arpon007.agro.model.CashoutRequest;
import com.arpon007.agro.model.CashoutRequest.CashoutStatus;
import com.arpon007.agro.model.Transaction.TransactionSource;
import com.arpon007.agro.model.Wallet;
import com.arpon007.agro.repository.CashoutRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
public class CashoutService {

    private final CashoutRequestRepository cashoutRequestRepository;
    private final WalletService walletService;

    public CashoutService(CashoutRequestRepository cashoutRequestRepository, WalletService walletService) {
        this.cashoutRequestRepository = cashoutRequestRepository;
        this.walletService = walletService;
    }

    /**
     * Request cashout
     */
    @Transactional
    public CashoutRequest requestCashout(CashoutRequest request) {
        // Validate amount
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Cashout amount must be positive");
        }

        // Check minimum amount (optional - can be configured)
        BigDecimal minAmount = new BigDecimal("500.00");
        if (request.getAmount().compareTo(minAmount) < 0) {
            throw new IllegalArgumentException("Minimum cashout amount is ৳500");
        }

        // Check wallet balance
        Wallet wallet = walletService.getOrCreateWallet(request.getUserId());
        if (!wallet.canWithdraw(request.getAmount())) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        // Check for pending requests
        List<CashoutRequest> pendingRequests = cashoutRequestRepository
                .findByUserIdOrderByRequestedAtDesc(request.getUserId())
                .stream()
                .filter(CashoutRequest::isPending)
                .toList();

        if (!pendingRequests.isEmpty()) {
            throw new IllegalArgumentException("You already have a pending cashout request");
        }

        // Create request
        request.setStatus(CashoutStatus.PENDING);
        return cashoutRequestRepository.save(request);
    }

    /**
     * Approve cashout request and generate invoice
     */
    @Transactional
    public CashoutRequest approveCashout(Long requestId, Long adminId) {
        System.out.println("DEBUG: Attempting to approve cashout request ID: " + requestId);
        
        CashoutRequest request = cashoutRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Cashout request not found"));

        System.out.println("DEBUG: Found request - ID: " + request.getId() + 
                          ", Status: " + request.getStatus() + 
                          ", isPending(): " + request.isPending());

        if (!request.isPending()) {
            System.out.println("DEBUG: Request is NOT pending. Current status: " + request.getStatus());
            throw new IllegalArgumentException("Only pending requests can be approved");
        }

        // Debit wallet
        walletService.debitWallet(
                request.getUserId(),
                request.getAmount(),
                TransactionSource.CASHOUT,
                "Cashout request #" + requestId);

        // Generate invoice URL (simplified - in production would generate actual PDF)
        String invoiceUrl = generateInvoiceUrl(request);

        // Approve request
        request.approve(adminId, invoiceUrl);
        return cashoutRequestRepository.save(request);
    }

    /**
     * Reject cashout request
     */
    @Transactional
    public CashoutRequest rejectCashout(Long requestId, Long adminId, String reason) {
        System.out.println("DEBUG: Attempting to reject cashout request ID: " + requestId + " with reason: " + reason);
        
        CashoutRequest request = cashoutRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Cashout request not found"));

        System.out.println("DEBUG: Found request - ID: " + request.getId() + 
                          ", Status: " + request.getStatus() + 
                          ", isPending(): " + request.isPending());

        if (!request.isPending()) {
            System.out.println("DEBUG: Request is NOT pending. Current status: " + request.getStatus());
            throw new IllegalArgumentException("Only pending requests can be rejected");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        request.reject(adminId, reason);
        return cashoutRequestRepository.save(request);
    }

    /**
     * Mark cashout as paid
     */
    @Transactional
    public CashoutRequest markAsPaid(Long requestId, String transactionRef) {
        CashoutRequest request = cashoutRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Cashout request not found"));

        if (!request.isApproved()) {
            throw new IllegalArgumentException("Only approved requests can be marked as paid");
        }

        request.markAsPaid(transactionRef);
        return cashoutRequestRepository.save(request);
    }

    /**
     * Get user's cashout requests
     */
    public List<CashoutRequest> getUserCashouts(Long userId) {
        return cashoutRequestRepository.findByUserIdOrderByRequestedAtDesc(userId);
    }

    /**
     * Get pending cashout requests (for admin)
     */
    public List<CashoutRequest> getPendingRequests() {
        return cashoutRequestRepository.findByStatus(CashoutStatus.PENDING);
    }

    /**
     * Get cashout requests by status
     */
    public List<CashoutRequest> getRequestsByStatus(CashoutStatus status) {
        return cashoutRequestRepository.findByStatus(status);
    }

    /**
     * Get cashout request by ID
     */
    public CashoutRequest getRequestById(Long requestId) {
        return cashoutRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Cashout request not found"));
    }

    /**
     * Generate invoice URL (simplified version)
     * In production, this would generate an actual PDF invoice
     */
    private String generateInvoiceUrl(CashoutRequest request) {
        String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
        String invoiceNumber = "INV-" + timestamp + "-" + request.getId();
        return "/invoices/" + invoiceNumber + ".pdf";
    }

    /**
     * Get statistics
     */
    public long getPendingCount() {
        return cashoutRequestRepository.countByStatus(CashoutStatus.PENDING);
    }
}
