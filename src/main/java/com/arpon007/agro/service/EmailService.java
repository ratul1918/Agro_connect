package com.arpon007.agro.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final ResourceLoader resourceLoader;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender, ResourceLoader resourceLoader) {
        this.mailSender = mailSender;
        this.resourceLoader = resourceLoader;
    }

    public void sendForgotPasswordEmail(String to, String resetLink) {
        try {
            String htmlContent = loadTemplate("forgot-password.html");
            htmlContent = htmlContent.replace("{{reset_link}}", resetLink);
            sendHtmlEmail(to, "Reset Your AgroConnect Password", htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send email");
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    private String loadTemplate(String templateName) throws IOException {
        Resource resource = resourceLoader.getResource("classpath:templates/email/" + templateName);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }
}
