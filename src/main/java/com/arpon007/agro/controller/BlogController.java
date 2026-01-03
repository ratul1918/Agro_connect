package com.arpon007.agro.controller;

import com.arpon007.agro.model.Blog;
import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.BlogRepository;
import com.arpon007.agro.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    public BlogController(BlogRepository blogRepository, UserRepository userRepository) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    // ==================== PUBLIC ENDPOINTS ====================

    @GetMapping
    public ResponseEntity<List<Blog>> getAllPublishedBlogs() {
        return ResponseEntity.ok(blogRepository.findAllPublished());
    }

    @GetMapping("/tips")
    public ResponseEntity<List<Blog>> getAllTips() {
        return ResponseEntity.ok(blogRepository.findAllPublishedByType("TIP"));
    }

    @GetMapping("/articles")
    public ResponseEntity<List<Blog>> getAllArticles() {
        return ResponseEntity.ok(blogRepository.findAllPublishedByType("NORMAL"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        return blogRepository.findById(id)
                .map(blog -> {
                    blogRepository.incrementViewCount(id);
                    return ResponseEntity.ok(blog);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== AGRONOMIST ENDPOINTS ====================

    @GetMapping("/my")
    public ResponseEntity<List<Blog>> getMyBlogs(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(blogRepository.findByAuthorId(user.getId()));
    }

    // Helper to save image
    private String saveCoverImage(MultipartFile file) {
        if (file == null || file.isEmpty())
            return null;
        try {
            String UPLOAD_DIR = "uploads/blogs/";
            java.nio.file.Files.createDirectories(java.nio.file.Paths.get(UPLOAD_DIR));

            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
            String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = java.util.UUID.randomUUID() + "_" + safeName;
            java.nio.file.Path path = java.nio.file.Paths.get(UPLOAD_DIR).resolve(fileName);

            java.nio.file.Files.write(path, file.getBytes(),
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.TRUNCATE_EXISTING);

            return "/uploads/blogs/" + fileName;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    @PostMapping
    public ResponseEntity<Blog> createBlog(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "coverImage", required = false) org.springframework.web.multipart.MultipartFile coverImage,
            @RequestParam("blogType") String blogType,
            @RequestParam(value = "isPublished", defaultValue = "false") boolean isPublished,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user is an Agronomist
        if (!user.getRoles().contains("ROLE_AGRONOMIST")) {
            return ResponseEntity.status(403).build();
        }

        Blog blog = new Blog();
        blog.setTitle(title);
        blog.setContent(content);
        blog.setBlogType(blogType);
        blog.setPublished(isPublished);
        blog.setAuthorId(user.getId());

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = saveCoverImage(coverImage);
            blog.setCoverImageUrl(imageUrl);
        }

        Blog saved = blogRepository.save(blog);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Blog> updateBlog(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "coverImage", required = false) org.springframework.web.multipart.MultipartFile coverImage,
            @RequestParam("blogType") String blogType,
            @RequestParam(value = "isPublished", defaultValue = "false") boolean isPublished,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Blog existing = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        // Only author can update
        if (!existing.getAuthorId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        existing.setTitle(title);
        existing.setContent(content);
        existing.setBlogType(blogType);
        existing.setPublished(isPublished);

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = saveCoverImage(coverImage);
            existing.setCoverImageUrl(imageUrl);
        }

        blogRepository.update(existing);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Blog existing = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        // Only author or admin can delete
        if (!existing.getAuthorId().equals(user.getId()) && !user.getRoles().contains("ROLE_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        blogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Blog deleted"));
    }

    // ==================== AGRONOMIST LISTING ====================

    @GetMapping("/agronomists")
    public ResponseEntity<List<User>> listAgronomists() {
        // Find all users with ROLE_AGRONOMIST
        List<User> agronomists = userRepository.findByRole("ROLE_AGRONOMIST");
        return ResponseEntity.ok(agronomists);
    }
}
