package com.arpon007.agro.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.arpon007.agro.dto.AuthRequest;
import com.arpon007.agro.dto.AuthResponse;
import com.arpon007.agro.dto.SignupRequest;
import com.arpon007.agro.model.User;
import com.arpon007.agro.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        authService.forgotPassword(payload.get("email"));
        return ResponseEntity.ok(Map.of("message", "Reset link sent to email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password reset successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(authService.getUserByEmail(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> payload) {
        String email = authentication.getName();
        authService.updateUserProfile(email, payload);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> payload) {
        String email = authentication.getName();
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current and new passwords are required"));
        }

        try {
            authService.changePassword(email, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
