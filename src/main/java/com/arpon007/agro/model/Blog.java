package com.arpon007.agro.model;

import java.sql.Timestamp;

public class Blog {
    private Long id;
    private Long authorId;
    private String title;
    private String content;
    private String coverImageUrl;
    private String blogType; // NORMAL or TIP
    private boolean isPublished;
    private int viewCount;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // For display
    private String authorName;
    private String authorImageUrl;

    public Blog() {
    }

    public Blog(Long id, Long authorId, String title, String content,
            String coverImageUrl, String blogType, boolean isPublished, int viewCount, Timestamp createdAt,
            Timestamp updatedAt, String authorName, String authorImageUrl) {
        this.id = id;
        this.authorId = authorId;
        this.title = title;
        this.content = content;
        this.coverImageUrl = coverImageUrl;
        this.blogType = blogType;
        this.isPublished = isPublished;
        this.viewCount = viewCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.authorName = authorName;
        this.authorImageUrl = authorImageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getBlogType() {
        return blogType;
    }

    public void setBlogType(String blogType) {
        this.blogType = blogType;
    }

    public boolean isPublished() {
        return isPublished;
    }

    public void setPublished(boolean published) {
        isPublished = published;
    }

    public int getViewCount() {
        return viewCount;
    }

    public void setViewCount(int viewCount) {
        this.viewCount = viewCount;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorImageUrl() {
        return authorImageUrl;
    }

    public void setAuthorImageUrl(String authorImageUrl) {
        this.authorImageUrl = authorImageUrl;
    }
}
