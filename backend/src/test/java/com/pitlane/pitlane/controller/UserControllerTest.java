package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.config.WithMockPitlaneUser;
import com.pitlane.pitlane.security.AuthTokenFilter;
import com.pitlane.pitlane.security.JwtUtil;
import com.pitlane.pitlane.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for UserController.
 * Tests cover the profile endpoint that returns the logged user information.
 * The User entity is resolved directly from the SecurityContext via @AuthenticationPrincipal.
 * Security tests are covered by SecurityIntegrationTest.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuthTokenFilter authTokenFilter;

    @BeforeEach
    void setUp() {
        // Configura o AuthTokenFilter mock para deixar passar os pedidos sem validar o JWT
        try {
            doAnswer(invocation -> {
                invocation.getArgument(2, jakarta.servlet.FilterChain.class).doFilter(
                        invocation.getArgument(0, jakarta.servlet.ServletRequest.class),
                        invocation.getArgument(1, jakarta.servlet.ServletResponse.class)
                );
                return null;
            }).when(authTokenFilter).doFilter(any(), any(), any());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ─── GET /api/users/me ────────────────────────────────────────────────────

    /**
     * Authenticated request to get user info should return 200 with display name and email.
     * The controller reads the user directly from @AuthenticationPrincipal injected by WithMockPitlaneUser.
     */
    @Test
    @WithMockPitlaneUser(email = "test@pitlane.com", displayName = "Test User")
    void getUserInfo_authenticated_returns200WithUserInfo() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@pitlane.com"));
    }

    /**
     * The email returned must match the authenticated user's email exactly
     */
    @Test
    @WithMockPitlaneUser(email = "other@pitlane.com", displayName = "Other User")
    void getUserInfo_returnsCorrectUserEmail() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("other@pitlane.com"))
                .andExpect(jsonPath("$.displayName").value("Other User"));
    }
}
