package com.arpon007.agro.security;

import com.arpon007.agro.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

/**
 * Custom implementation of UserDetails that wraps our User entity
 * and provides access to user ID and other custom fields
 */
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final String fullName;
    private final boolean emailVerified;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.fullName = user.getFullName();
        this.emailVerified = user.isEmailVerified();
        this.authorities = mapRolesToAuthorities(user.getRoles());
    }

    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(java.util.Set<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    // Custom getters
    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    // UserDetails interface methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // Using email as username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Previously, we restricted login to email-verified users only.
        // Requirement: "remove all login disable" -> allow all users to log in regardless of email verification.
        return true;
    }
}
