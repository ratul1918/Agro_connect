package com.arpon007.agro.service;

import com.arpon007.agro.model.Transaction;
import com.arpon007.agro.model.Transaction.TransactionSource;
import com.arpon007.agro.model.Transaction.TransactionType;
import com.arpon007.agro.model.Wallet;
import com.arpon007.agro.repository.TransactionRepository;
import com.arpon007.agro.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Get or create wallet for a user
     */
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet wallet = new Wallet();
                    wallet.setUserId(userId);
                    return walletRepository.save(wallet);
                });
    }

    /**
     * Get wallet balance
     */
    public BigDecimal getBalance(Long userId) {
        return getOrCreateWallet(userId).getBalance();
    }

    /**
     * Credit wallet (add money)
     */
    @Transactional
    public Wallet creditWallet(Long userId, BigDecimal amount, TransactionSource source, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }

        Wallet wallet = getOrCreateWallet(userId);
        wallet.credit(amount);
        wallet = walletRepository.save(wallet);

        // Record transaction
        Transaction transaction = new Transaction();
        transaction.setWalletId(wallet.getId());
        transaction.setType(TransactionType.CREDIT);
        transaction.setAmount(amount);
        transaction.setSource(source);
        transaction.setDescription(description);
        transactionRepository.save(transaction);

        return wallet;
    }

    /**
     * Debit wallet (deduct money)
     */
    @Transactional
    public Wallet debitWallet(Long userId, BigDecimal amount, TransactionSource source, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }

        Wallet wallet = getOrCreateWallet(userId);

        if (!wallet.canWithdraw(amount)) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        wallet.debit(amount);
        wallet = walletRepository.save(wallet);

        // Record transaction
        Transaction transaction = new Transaction();
        transaction.setWalletId(wallet.getId());
        transaction.setType(TransactionType.DEBIT);
        transaction.setAmount(amount);
        transaction.setSource(source);
        transaction.setDescription(description);
        transactionRepository.save(transaction);

        return wallet;
    }

    /**
     * Get transaction history
     */
    public List<Transaction> getTransactionHistory(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    /**
     * Get transaction history with pagination
     */
    public List<Transaction> getTransactionHistory(Long userId, int page, int size) {
        Wallet wallet = getOrCreateWallet(userId);
        return transactionRepository.findByWalletIdWithPagination(wallet.getId(), page, size);
    }

    /**
     * Get total transaction count
     */
    public long getTransactionCount(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return transactionRepository.countByWalletId(wallet.getId());
    }
}
