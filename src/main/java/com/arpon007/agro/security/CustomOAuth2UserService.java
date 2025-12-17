package com.arpon007.agro.security;

import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        // Extract details (Google specific for now)
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Only update profile image if logging in via OAuth
            // DO NOT overwrite existing name/data - preserve user's original registration
            // data
            if (picture != null && !picture.isEmpty()) {
                user.setProfileImageUrl(picture);
                // Note: We can't easily update in JDBC without a dedicated update method
                // For now, just use the existing user as-is
            }
            // User already exists - their existing role and data are preserved
        } else {
            // Register new user (only happens if they've never registered before)
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setProfileImageUrl(picture);
            user.setVerified(true);
            user.setPhone(""); // Phone not provided by Google
            user.setCountry("Bangladesh"); // Default country
            user.setDistrict("");
            // Generate random password (not used for OAuth login)
            user.setPasswordHash(UUID.randomUUID().toString());

            userRepository.save(user);

            // Assign default role: ROLE_BUYER for new OAuth users
            User savedUser = userRepository.findByEmail(email).orElseThrow();
            userRepository.addRole(savedUser.getId(), "ROLE_BUYER");
        }

        return oauth2User;
    }
}
