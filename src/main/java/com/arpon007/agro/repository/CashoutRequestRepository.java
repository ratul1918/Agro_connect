package com.arpon007.agro.repository;

import com.arpon007.agro.model.CashoutRequest;
import com.arpon007.agro.model.CashoutRequest.CashoutStatus;
import com.arpon007.agro.model.CashoutRequest.PaymentMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class CashoutRequestRepository {

    private final JdbcTemplate jdbcTemplate;

    public CashoutRequestRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<CashoutRequest> cashoutRequestRowMapper = (rs, rowNum) -> {
        String statusStr = rs.getString("status");
        System.out.println("DEBUG: Raw status from DB: '" + statusStr + "'");
        
        CashoutStatus status = null;
        try {
            status = CashoutStatus.valueOf(statusStr);
            System.out.println("DEBUG: Parsed status: " + status);
        } catch (Exception e) {
            System.out.println("DEBUG: Failed to parse status, defaulting to PENDING. Error: " + e.getMessage());
            status = CashoutStatus.PENDING;
        }
        
        CashoutRequest request = new CashoutRequest(
                rs.getLong("id"),
                rs.getLong("user_id"),
                rs.getBigDecimal("amount"),
                PaymentMethod.valueOf(rs.getString("payment_method")),
                rs.getString("account_details"),
                status,
                rs.getString("admin_note"),
                rs.getString("invoice_url"),
                rs.getString("transaction_ref"),
                rs.getTimestamp("requested_at"),
                rs.getTimestamp("processed_at"),
                (Long) rs.getObject("processed_by"));

        // Add user details if available (for joined queries)
        try {
            request.setUserName(rs.getString("user_name"));
            request.setUserEmail(rs.getString("user_email"));
        } catch (Exception ignored) {
            // Columns not present in non-joined queries
        }

        return request;
    };

    public List<CashoutRequest> findByUserIdOrderByRequestedAtDesc(Long userId) {
        String sql = "SELECT * FROM cashout_requests WHERE user_id = ? ORDER BY requested_at DESC";
        return jdbcTemplate.query(sql, cashoutRequestRowMapper, userId);
    }

    public List<CashoutRequest> findByStatus(CashoutStatus status) {
        String sql = """
                SELECT cr.*, u.full_name as user_name, u.email as user_email
                FROM cashout_requests cr
                JOIN users u ON cr.user_id = u.id
                WHERE cr.status = ?
                ORDER BY cr.requested_at DESC
                """;
        return jdbcTemplate.query(sql, cashoutRequestRowMapper, status.name());
    }

    public List<CashoutRequest> findByStatusWithPagination(CashoutStatus status, int page, int size) {
        int offset = page * size;
        String sql = """
                SELECT cr.*, u.full_name as user_name, u.email as user_email
                FROM cashout_requests cr
                JOIN users u ON cr.user_id = u.id
                WHERE cr.status = ?
                ORDER BY cr.requested_at DESC
                LIMIT ? OFFSET ?
                """;
        return jdbcTemplate.query(sql, cashoutRequestRowMapper, status.name(), size, offset);
    }

    public Optional<CashoutRequest> findById(Long id) {
        String sql = """
                SELECT cr.*, u.full_name as user_name, u.email as user_email
                FROM cashout_requests cr
                JOIN users u ON cr.user_id = u.id
                WHERE cr.id = ?
                """;
        System.out.println("DEBUG: Finding cashout request by ID: " + id);
        List<CashoutRequest> requests = jdbcTemplate.query(sql, cashoutRequestRowMapper, id);
        System.out.println("DEBUG: Found " + requests.size() + " requests");
        if (!requests.isEmpty()) {
            CashoutRequest req = requests.get(0);
            System.out.println("DEBUG: Request from DB - ID: " + req.getId() + 
                              ", Status: " + req.getStatus() + 
                              ", Status class: " + (req.getStatus() != null ? req.getStatus().getClass().getName() : "null"));
        }
        return requests.stream().findFirst();
    }

    public CashoutRequest save(CashoutRequest request) {
        if (request.getId() == null) {
            return insert(request);
        } else {
            return update(request);
        }
    }

    private CashoutRequest insert(CashoutRequest request) {
        String sql = "INSERT INTO cashout_requests (user_id, amount, payment_method, account_details, status) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, request.getUserId());
            ps.setBigDecimal(2, request.getAmount());
            ps.setString(3, request.getPaymentMethod().name());
            ps.setString(4, request.getAccountDetails());
            ps.setString(5, request.getStatus().name());
            return ps;
        }, keyHolder);

        request.setId(keyHolder.getKey().longValue());
        return request;
    }

    private CashoutRequest update(CashoutRequest request) {
        String sql = """
                UPDATE cashout_requests
                SET status = ?, admin_note = ?, invoice_url = ?, transaction_ref = ?,
                    processed_at = ?, processed_by = ?
                WHERE id = ?
                """;
        jdbcTemplate.update(sql,
                request.getStatus().name(),
                request.getAdminNote(),
                request.getInvoiceUrl(),
                request.getTransactionRef(),
                request.getProcessedAt(),
                request.getProcessedBy(),
                request.getId());
        return request;
    }

    public long countByStatus(CashoutStatus status) {
        String sql = "SELECT COUNT(*) FROM cashout_requests WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status.name());
        return count != null ? count : 0;
    }
}
