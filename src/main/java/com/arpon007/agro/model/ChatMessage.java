package com.arpon007.agro.model;

import java.sql.Timestamp;

public class ChatMessage {
    private Long id;
    private Long chatId;
    private Long senderId;
    private String content;
    private Boolean isRead;
    private Timestamp sentAt;

    public ChatMessage() {
    }

    public ChatMessage(Long id, Long chatId, Long senderId, String content, Boolean isRead, Timestamp sentAt) {
        this.id = id;
        this.chatId = chatId;
        this.senderId = senderId;
        this.content = content;
        this.isRead = isRead;
        this.sentAt = sentAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Timestamp getSentAt() {
        return sentAt;
    }

    public void setSentAt(Timestamp sentAt) {
        this.sentAt = sentAt;
    }
}
