package com.arpon007.agro.controller;

import com.arpon007.agro.model.ChatMessage;
import com.arpon007.agro.repository.ChatRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository chatRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatRepository chatRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatRepository = chatRepository;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatRepository.save(chatMessage);
        messagingTemplate.convertAndSend("/topic/public", chatMessage);
    }

    // P2P Chat
    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage) {
        chatRepository.save(chatMessage);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getSenderId()), // This is wrong, should be recipient
                "/queue/messages",
                chatMessage);
    }
}
