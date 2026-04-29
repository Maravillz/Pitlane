package com.pitlane.pitlane.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitlane.pitlane.config.WithMockPitlaneUser;
import com.pitlane.pitlane.dto.AlertResponseDto;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.security.AuthTokenFilter;
import com.pitlane.pitlane.security.JwtUtil;
import com.pitlane.pitlane.service.AlertService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for AlertController.
 * Tests cover HTTP status codes and response body.
 * Security tests are covered by SecurityIntegrationTest.
 * The AlertService is mocked to isolate the controller layer from business logic.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AlertService alertService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuthTokenFilter authTokenFilter;

    private User user;
    private UUID alertId;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@pitlane.com")
                .displayName("Test User")
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .build();

        alertId = UUID.randomUUID();

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

    // ─── GET /api/alerts ─────────────────────────────────────────────────────

    /**
     * Authenticated request to get all alerts should return 200 with the alert list
     */
    @Test
    @WithMockPitlaneUser
    void getUserAlerts_authenticated_returns200WithAlerts() throws Exception {
        AlertResponseDto alert = AlertResponseDto.builder()
                .id(alertId)
                .maintenanceType(Maintenance.MaintenanceType.OIL_CHANGE)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        when(alertService.getAlertsByUser(any(User.class))).thenReturn(List.of(alert));

        mockMvc.perform(get("/api/alerts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].intervalKm").value(10000))
                .andExpect(jsonPath("$[0].maintenanceType").value("OIL_CHANGE"));
    }

    /**
     * Authenticated request with no alerts should return 200 with empty list
     */
    @Test
    @WithMockPitlaneUser
    void getUserAlerts_noAlerts_returns200WithEmptyList() throws Exception {
        when(alertService.getAlertsByUser(any(User.class))).thenReturn(List.of());

        mockMvc.perform(get("/api/alerts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ─── PATCH /api/alerts/{id}/resolve ──────────────────────────────────────

    /**
     * Authenticated request to resolve an alert should return 200
     */
    @Test
    @WithMockPitlaneUser
    void resolveAlert_authenticated_returns200() throws Exception {
        doNothing().when(alertService).resolveAlert(any(UUID.class), any(User.class));

        mockMvc.perform(patch("/api/alerts/{id}/resolve", alertId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
