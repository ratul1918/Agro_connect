package com.arpon007.agro.security;

import com.arpon007.agro.model.User;
import com.arpon007.agro.repository.UserRepository;
import com.arpon007.agro.service.CustomUserDetailsService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CustomUserDetailsService userDetailsService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2SuccessHandler(JwtUtil jwtUtil, UserRepository userRepository,
            CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oauth2User.getAttributes().get("email");

        // Fetch our user to get ID and Roles for JWT
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Use UserDetailsService to get proper UserDetails object
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String roleName = user.getRoles().stream().findFirst().orElse("ROLE_USER");
            String token = jwtUtil.generateToken(userDetails, user.getId(), roleName);

            // Redirect to frontend with token
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                    .queryParam("token", token)
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }
}
