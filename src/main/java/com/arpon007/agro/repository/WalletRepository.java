package com.arpon007.agro.repository;

import com.arpon007.agro.model.Wallet;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Optional;

@Repository
public class WalletRepository {

    private final JdbcTemplate jdbcTemplate;

    public WalletRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Wallet> walletRowMapper = (rs, rowNum) -> new Wallet(
            rs.getLong("id"),
            rs.getLong("user_id"),
            rs.getBigDecimal("balance"),
            rs.getBigDecimal("total_earned"),
            rs.getBigDecimal("total_withdrawn"),
            rs.getTimestamp("created_at"),
            rs.getTimestamp("updated_at"));

    public Optional<Wallet> findByUserId(Long userId) {
        String sql = "SELECT * FROM wallets WHERE user_id = ?";
        return jdbcTemplate.query(sql, walletRowMapper, userId).stream().findFirst();
    }

    public Wallet save(Wallet wallet) {
        if (wallet.getId() == null) {
            return insert(wallet);
        } else {
            return update(wallet);
        }
    }

    private Wallet insert(Wallet w) {
        String sql = "INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        // Extract values before lambda to avoid Lombok getter issues
        final Long userId = w.getUserId();
        final BigDecimal balance = w.getBalance();
        final BigDecimal totalEarned = w.getTotalEarned();
        final BigDecimal totalWithdrawn = w.getTotalWithdrawn();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId);
            ps.setBigDecimal(2, balance);
            ps.setBigDecimal(3, totalEarned);
            ps.setBigDecimal(4, totalWithdrawn);
            return ps;
        }, keyHolder);

        w.setId(keyHolder.getKey().longValue());
        return w;
    }

    private Wallet update(Wallet w) {
        String sql = "UPDATE wallets SET balance = ?, total_earned = ?, total_withdrawn = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        jdbcTemplate.update(sql,
                w.getBalance(),
                w.getTotalEarned(),
                w.getTotalWithdrawn(),
                w.getId());
        return w;
    }

    public int updateBalance(Long walletId, BigDecimal newBalance, BigDecimal totalEarned, BigDecimal totalWithdrawn) {
        String sql = "UPDATE wallets SET balance = ?, total_earned = ?, total_withdrawn = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, newBalance, totalEarned, totalWithdrawn, walletId);
    }
}
