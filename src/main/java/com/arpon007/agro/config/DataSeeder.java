package com.arpon007.agro.config;

import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Value("${admin.email:admin@agro.com}")
    private String adminEmail;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        logger.info("=== DataSeeder Starting ===");
        logger.info("Checking for admin user with email: {}", adminEmail);

        try {
            if (!userRepository.existsByEmail(adminEmail)) {
                logger.info("Admin user does not exist. Creating new admin...");

                User admin = new User();
                admin.setFullName("Super Admin");
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                admin.setPhone("00000000000");
                admin.setCountry("Bangladesh");
                admin.setDivision("Dhaka");
                admin.setDistrict("Dhaka");
                admin.setVerified(true);
                admin.setEmailVerified(true); // This is what Spring Security checks!

                // Save user
                User savedAdmin = userRepository.save(admin);
                logger.info("Admin user saved with ID: {}", savedAdmin.getId());

                // Assign ROLE_ADMIN
                userRepository.addRole(savedAdmin.getId(), "ROLE_ADMIN");
                logger.info("ROLE_ADMIN assigned to admin user");

                logger.info("=== Admin user created successfully ===");
                logger.info("Email: {}", adminEmail);
                logger.info("Password: [HIDDEN]");
            } else {
                // Admin exists - ensure they have the ROLE_ADMIN role and emailVerified is true
                logger.info("Admin user already exists with email: {}", adminEmail);
                var adminOpt = userRepository.findByEmail(adminEmail);
                if (adminOpt.isPresent()) {
                    User admin = adminOpt.get();

                    // Ensure emailVerified is true (for login to work)
                    if (!admin.isEmailVerified()) {
                        logger.info("Admin user has emailVerified=false. Updating...");
                        admin.setEmailVerified(true);
                        userRepository.save(admin);
                        logger.info("Admin emailVerified set to true");
                    }

                    // Ensure admin has ROLE_ADMIN
                    if (admin.getRoles() == null || admin.getRoles().isEmpty()
                            || !admin.getRoles().contains("ROLE_ADMIN")) {
                        logger.info("Admin user exists but has no ROLE_ADMIN. Assigning role...");
                        userRepository.addRole(admin.getId(), "ROLE_ADMIN");
                        logger.info("ROLE_ADMIN assigned to existing admin user");
                    } else {
                        logger.info("Admin user has ROLE_ADMIN. All good!");
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error during admin seeding: {}", e.getMessage(), e);
        }

        logger.info("=== DataSeeder Completed ===");
    }
}
