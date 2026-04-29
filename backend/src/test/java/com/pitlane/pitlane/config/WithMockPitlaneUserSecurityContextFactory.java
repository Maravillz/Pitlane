package com.pitlane.pitlane.config;

import com.pitlane.pitlane.model.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.time.LocalDateTime;
import java.util.UUID;

public class WithMockPitlaneUserSecurityContextFactory
        implements WithSecurityContextFactory<WithMockPitlaneUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockPitlaneUser annotation) {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(annotation.email())
                .displayName(annotation.displayName())
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .build();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        return context;
    }
}