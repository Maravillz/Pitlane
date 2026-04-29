package com.pitlane.pitlane.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitlane.pitlane.config.WithMockPitlaneUser;
import com.pitlane.pitlane.dto.CreateMaintenanceRequestDto;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import com.pitlane.pitlane.security.AuthTokenFilter;
import com.pitlane.pitlane.security.JwtUtil;
import com.pitlane.pitlane.service.CustomUserDetailsService;
import com.pitlane.pitlane.service.MaintenanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for MaintenanceController.
 * Tests cover maintenance creation and response format.
 * Security tests are covered by SecurityIntegrationTest.
 * The MaintenanceService is mocked to isolate the controller layer from business logic.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MaintenanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MaintenanceService maintenanceService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuthTokenFilter authTokenFilter;

    private User user;
    private UUID vehicleId;
    private CreateMaintenanceRequestDto dto;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@pitlane.com")
                .displayName("Test User")
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .build();

        vehicleId = UUID.randomUUID();

        dto = new CreateMaintenanceRequestDto();
        dto.setMaintenanceType(Maintenance.MaintenanceType.OIL_CHANGE);
        dto.setDate(LocalDate.now());
        dto.setMileage(100000);
        dto.setCostCents(4500);
        dto.setCreateAlert(false);

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

    // ─── POST /api/maintenance ────────────────────────────────────────────────

    /**
     * Authenticated request to create a maintenance should return 200 with the maintenance id
     */
    @Test
    @WithMockPitlaneUser
    void createMaintenance_authenticated_returns200WithId() throws Exception {
        Vehicle vehicle = Vehicle.builder()
                .id(vehicleId)
                .user(user)
                .brand("Honda")
                .model("Civic")
                .year((short) 1998)
                .currentMileage(100000)
                .createdAt(LocalDateTime.now())
                .build();

        Maintenance maintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(dto.getMaintenanceType())
                .date(dto.getDate())
                .mileage(dto.getMileage())
                .costCents(dto.getCostCents())
                .createdAt(LocalDateTime.now())
                .build();

        when(maintenanceService.createMaintenance(
                eq(vehicleId),
                any(User.class),
                any(CreateMaintenanceRequestDto.class)
        )).thenReturn(maintenance);

        mockMvc.perform(post("/api/maintenance")
                        .param("vehicleId", vehicleId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string(maintenance.getId().toString()));
    }
}
