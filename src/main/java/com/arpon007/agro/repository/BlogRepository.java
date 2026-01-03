package com.arpon007.agro.repository;

import com.arpon007.agro.model.Blog;
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
public class BlogRepository {

    private final JdbcTemplate jdbcTemplate;

    public BlogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Blog> blogRowMapper = (rs, rowNum) -> {
        Blog blog = new Blog();
        blog.setId(rs.getLong("id"));
        blog.setAuthorId(rs.getLong("author_id"));
        blog.setTitle(rs.getString("title"));
        blog.setContent(rs.getString("content"));
        blog.setCoverImageUrl(rs.getString("cover_image_url"));
        blog.setBlogType(rs.getString("blog_type"));
        blog.setPublished(rs.getBoolean("is_published"));
        blog.setViewCount(rs.getInt("view_count"));
        blog.setCreatedAt(rs.getTimestamp("created_at"));
        blog.setUpdatedAt(rs.getTimestamp("updated_at"));
        // Join fields if available
        try {
            blog.setAuthorName(rs.getString("author_name"));
            blog.setAuthorImageUrl(rs.getString("author_image"));
        } catch (Exception ignored) {
        }
        return blog;
    };

    public Blog save(Blog blog) {
        String sql = "INSERT INTO blogs (author_id, title, content, cover_image_url, blog_type, is_published) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, blog.getAuthorId());
            ps.setString(2, blog.getTitle());
            ps.setString(3, blog.getContent());
            ps.setString(4, blog.getCoverImageUrl());
            ps.setString(5, blog.getBlogType() != null ? blog.getBlogType() : "NORMAL");
            ps.setBoolean(6, blog.isPublished());
            return ps;
        }, keyHolder);
        blog.setId(keyHolder.getKey().longValue());
        return blog;
    }

    public List<Blog> findAllPublished() {
        String sql = """
                SELECT b.*, u.full_name as author_name, u.profile_image_url as author_image
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE b.is_published = true
                ORDER BY b.created_at DESC
                """;
        return jdbcTemplate.query(sql, blogRowMapper);
    }

    public List<Blog> findAllPublishedByType(String type) {
        String sql = """
                SELECT b.*, u.full_name as author_name, u.profile_image_url as author_image
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE b.is_published = true AND b.blog_type = ?
                ORDER BY b.created_at DESC
                """;
        return jdbcTemplate.query(sql, blogRowMapper, type);
    }

    public List<Blog> findByAuthorId(Long authorId) {
        String sql = """
                SELECT b.*, u.full_name as author_name, u.profile_image_url as author_image
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE b.author_id = ?
                ORDER BY b.created_at DESC
                """;
        return jdbcTemplate.query(sql, blogRowMapper, authorId);
    }

    public Optional<Blog> findById(Long id) {
        String sql = """
                SELECT b.*, u.full_name as author_name, u.profile_image_url as author_image
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE b.id = ?
                """;
        return jdbcTemplate.query(sql, blogRowMapper, id).stream().findFirst();
    }

    public void incrementViewCount(Long id) {
        jdbcTemplate.update("UPDATE blogs SET view_count = view_count + 1 WHERE id = ?", id);
    }

    public void update(Blog blog) {
        String sql = "UPDATE blogs SET title = ?, content = ?, cover_image_url = ?, blog_type = ?, is_published = ? WHERE id = ?";
        jdbcTemplate.update(sql, blog.getTitle(), blog.getContent(),
                blog.getCoverImageUrl(), blog.getBlogType(), blog.isPublished(), blog.getId());
    }

    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM blogs WHERE id = ?", id);
    }
}
