package com.arpon007.agro.service;

import java.util.Date;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arpon007.agro.dto.AuthRequest;
import com.arpon007.agro.dto.AuthResponse;
import com.arpon007.agro.dto.SignupRequest;
import com.arpon007.agro.model.PasswordResetToken;
import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.PasswordResetTokenRepository;
import com.arpon007.agro.repository.UserRepository;
import com.arpon007.agro.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public AuthService(UserRepository userRepository, PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        logger.info("=== SIGNUP ATTEMPT ===");
        logger.info("Email: {}", request.getEmail());
        logger.info("Full Name: {}", request.getFullName());
        logger.info("Role: {}", request.getRole());

        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Signup failed: Email {} already exists", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry() != null ? request.getCountry() : "Bangladesh");
        user.setDivision(request.getDivision());
        user.setDistrict(request.getDistrict());
        user.setUpazila(request.getUpazila());
        user.setThana(request.getThana());
        user.setPostCode(request.getPostCode());
        user.setVerified(true); // User verified to prevent 'disabled' error
        user.setEmailVerified(true); // Auto-verify email for now as requested

        User savedUser;
        try {
            savedUser = userRepository.save(user);
            logger.info("User saved successfully with ID: {}", savedUser.getId());
        } catch (Exception e) {
            logger.error("Failed to save user {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Signup failed due to database error");
        }

        // Assign Role
        try {
            String roleName = "ROLE_" + request.getRole().toUpperCase();
            userRepository.addRole(savedUser.getId(), roleName);
            logger.info("Role {} assigned to user ID: {}", roleName, savedUser.getId());
        } catch (Exception e) {
            logger.error("Failed to assign role to user ID {}: {}", savedUser.getId(), e.getMessage());
            // We continue as the user is saved, though it might cause issues later
        }

        // Generate Token
        var userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtUtil.generateToken(userDetails, savedUser.getId(), request.getRole().toUpperCase());

        logger.info("=== SIGNUP SUCCESS ===");
        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(),
                "ROLE_" + request.getRole().toUpperCase(), savedUser.getFullName(),
                savedUser.getProfileImageUrl());
    }

    public AuthResponse login(AuthRequest request) {
        logger.info("=== LOGIN ATTEMPT ===");
        logger.info("Email: {}", request.getEmail());

        // Check if user exists first
        var existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isEmpty()) {
            logger.error("ERROR: User not found in database with email: {}", request.getEmail());
            // Double check count to see if DB is empty
            logger.info("Total users currently in DB: {}", userRepository.countAll());
            throw new RuntimeException("Invalid email or password");
        }

        User user = existingUser.get();
        logger.info("User found: ID={}, Name={}", user.getId(), user.getFullName());

        // Check password matches
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!passwordMatches) {
            logger.error("ERROR: Password does not match for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            logger.info("Authentication successful via AuthenticationManager");
        } catch (Exception e) {
            logger.error("ERROR during session authentication: {}", e.getMessage());
            throw new RuntimeException("Invalid email or password");
        }

        var userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        // Check if user has roles - if not, assign default ROLE_GENERAL_CUSTOMER
        String role;
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            logger.info("User has no roles, assigning ROLE_GENERAL_CUSTOMER");
            userRepository.addRole(user.getId(), "ROLE_GENERAL_CUSTOMER");
            role = "ROLE_GENERAL_CUSTOMER";
        } else {
            role = user.getRoles().iterator().next();
        }
        logger.info("User role: {}", role);

        // Remove ROLE_ prefix for JWT token since Spring Security adds it automatically
        // when checking hasRole()
        String tokenRole = role.startsWith("ROLE_") ? role.substring(5) : role;

        String token = jwtUtil.generateToken(userDetails, user.getId(), tokenRole);
        logger.info("=== LOGIN SUCCESS ===");

        return new AuthResponse(token, user.getId(), user.getEmail(), "ROLE_" + tokenRole, user.getFullName(),
                user.getProfileImageUrl());
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        tokenRepository.createToken(user.getId(), token);

        // Send Email

        // Send Email
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        System.out.println("Reset Link: " + resetLink); // Log for dev

        // Send actual HTML email
        try {
            emailService.sendForgotPasswordEmail(email, resetLink);
            System.out.println("Email sent successfully to " + email);
        } catch (Exception e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.getExpiryDate().before(new Date())) {
            throw new RuntimeException("Token expired");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.updatePassword(user.getId(), passwordEncoder.encode(newPassword));
        tokenRepository.deleteByToken(token);
    }

    public com.arpon007.agro.model.User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void updateUserProfile(String email, java.util.Map<String, String> payload) {
        System.out.println("Updating profile for: " + email);
        System.out.println("Payload: " + payload);

        com.arpon007.agro.model.User user = getUserByEmail(email);

        if (payload.containsKey("fullName")) {
            user.setFullName(payload.get("fullName"));
        }
        if (payload.containsKey("phone")) {
            user.setPhone(payload.get("phone"));
        }
        if (payload.containsKey("country")) {
            user.setCountry(payload.get("country"));
        }
        if (payload.containsKey("division")) {
            user.setDivision(payload.get("division"));
        }
        if (payload.containsKey("district")) {
            user.setDistrict(payload.get("district"));
        }
        if (payload.containsKey("upazila")) {
            user.setUpazila(payload.get("upazila"));
        }
        if (payload.containsKey("thana")) {
            user.setThana(payload.get("thana"));
        }
        if (payload.containsKey("postCode")) {
            user.setPostCode(payload.get("postCode"));
        }

        User savedUser = userRepository.save(user);
        System.out.println("User saved successfully: " + savedUser.getId());
        System.out.println("Saved District: " + savedUser.getDistrict());
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = getUserByEmail(email);

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update to new password
        userRepository.updatePassword(user.getId(), passwordEncoder.encode(newPassword));
    }
}
