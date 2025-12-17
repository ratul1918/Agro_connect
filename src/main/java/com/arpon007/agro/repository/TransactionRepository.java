package com.arpon007.agro.repository;

import com.arpon007.agro.model.Transaction;
import com.arpon007.agro.model.Transaction.TransactionType;
import com.arpon007.agro.model.Transaction.TransactionSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class TransactionRepository {

    private final JdbcTemplate jdbcTemplate;

    public TransactionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Transaction> transactionRowMapper = (rs, rowNum) -> new Transaction(
            rs.getLong("id"),
            rs.getLong("wallet_id"),
            TransactionType.valueOf(rs.getString("type")),
            rs.getBigDecimal("amount"),
            TransactionSource.valueOf(rs.getString("source")),
            (Long) rs.getObject("reference_id"),
            rs.getString("description"),
            rs.getTimestamp("created_at"));

    public List<Transaction> findByWalletIdOrderByCreatedAtDesc(Long walletId) {
        String sql = "SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 100";
        return jdbcTemplate.query(sql, transactionRowMapper, walletId);
    }

    public List<Transaction> findByWalletIdWithPagination(Long walletId, int page, int size) {
        int offset = page * size;
        String sql = "SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, transactionRowMapper, walletId, size, offset);
    }

    public Transaction save(Transaction t) {
        String sql = "INSERT INTO transactions (wallet_id, type, amount, source, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        // Extract values before lambda
        final Long walletId = t.getWalletId();
        final TransactionType type = t.getType();
        final BigDecimal amount = t.getAmount();
        final TransactionSource source = t.getSource();
        final Long refId = t.getReferenceId();
        final String desc = t.getDescription();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, walletId);
            ps.setString(2, type.name());
            ps.setBigDecimal(3, amount);
            ps.setString(4, source.name());
            if (refId != null) {
                ps.setLong(5, refId);
            } else {
                ps.setNull(5, java.sql.Types.BIGINT);
            }
            ps.setString(6, desc);
            return ps;
        }, keyHolder);

        t.setId(keyHolder.getKey().longValue());
        return t;
    }

    public long countByWalletId(Long walletId) {
        String sql = "SELECT COUNT(*) FROM transactions WHERE wallet_id = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, walletId);
        return count != null ? count : 0;
    }
}
