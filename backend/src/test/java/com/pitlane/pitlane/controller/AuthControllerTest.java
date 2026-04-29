package com.pitlane.pitlane.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitlane.pitlane.dto.AuthResponseDto;
import com.pitlane.pitlane.dto.LoginRequestDto;
import com.pitlane.pitlane.dto.RegisterRequestDto;
import com.pitlane.pitlane.security.AuthTokenFilter;
import com.pitlane.pitlane.security.JwtUtil;
import com.pitlane.pitlane.service.AuthService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for AuthController.
 * Auth endpoints are public — no authentication required.
 * Tests cover token generation on login and register, and validation of required fields.
 * The AuthService is mocked to isolate the controller layer from business logic.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

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

    // ─── POST /api/auth/login ─────────────────────────────────────────────────

    /**
     * Login with valid credentials should return 200 with a token
     */
    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("test@pitlane.com");
        request.setPassword("password123");

        when(authService.login(any(LoginRequestDto.class))).thenReturn(new AuthResponseDto("jwt-token"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    /**
     * Login with missing required fields should return 400 due to Bean Validation
     */
    @Test
    void login_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    // ─── POST /api/auth/register ──────────────────────────────────────────────

    /**
     * Register with valid data should return 200 with a token
     */
    @Test
    void register_validRequest_returns200WithToken() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto();
        request.setEmail("new@pitlane.com");
        request.setPassword("password123");
        request.setDisplayName("New User");

        when(authService.register(any(RegisterRequestDto.class))).thenReturn(new AuthResponseDto("jwt-token"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    /**
     * Register with missing required fields should return 400 due to Bean Validation
     */
    @Test
    void register_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
