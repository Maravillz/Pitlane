package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.config.WithMockPitlaneUser;
import com.pitlane.pitlane.dto.CostsSummaryDto;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.security.AuthTokenFilter;
import com.pitlane.pitlane.security.JwtUtil;
import com.pitlane.pitlane.service.CostsService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for CostsController.
 * Tests cover period filtering and response structure.
 * Security tests are covered by SecurityIntegrationTest.
 * The CostsService is mocked to isolate the controller layer from business logic.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CostsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CostsService costsService;

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

    // ─── GET /api/costs ───────────────────────────────────────────────────────

    /**
     * Authenticated request to get costs should return 200 with the summary
     */
    @Test
    @WithMockPitlaneUser
    void getCosts_authenticated_returns200WithSummary() throws Exception {
        CostsSummaryDto summary = CostsSummaryDto.builder()
                .totalCents(22500)
                .byCategory(List.of())
                .byVehicle(List.of())
                .build();

        when(costsService.getCostsSummary(any(User.class), eq("year"))).thenReturn(summary);

        mockMvc.perform(get("/api/costs")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCents").value(22500));
    }

    /**
     * Request with period parameter month should pass the correct period to the service
     */
    @Test
    @WithMockPitlaneUser
    void getCosts_withMonthPeriod_passesCorrectPeriodToService() throws Exception {
        CostsSummaryDto summary = CostsSummaryDto.builder()
                .totalCents(5000)
                .byCategory(List.of())
                .byVehicle(List.of())
                .build();

        when(costsService.getCostsSummary(any(User.class), eq("month"))).thenReturn(summary);

        mockMvc.perform(get("/api/costs")
                        .param("period", "month")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCents").value(5000));
    }

    /**
     * Request without period parameter should default to year
     */
    @Test
    @WithMockPitlaneUser
    void getCosts_withoutPeriodParam_defaultsToYear() throws Exception {
        CostsSummaryDto summary = CostsSummaryDto.builder()
                .totalCents(0)
                .byCategory(List.of())
                .byVehicle(List.of())
                .build();

        when(costsService.getCostsSummary(any(User.class), eq("year"))).thenReturn(summary);

        mockMvc.perform(get("/api/costs")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCents").value(0));
    }
}
