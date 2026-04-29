package com.pitlane.pitlane.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitlane.pitlane.config.WithMockPitlaneUser;
import com.pitlane.pitlane.dto.*;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.security.AuthTokenFilter;
import com.pitlane.pitlane.security.JwtUtil;
import com.pitlane.pitlane.service.CustomUserDetailsService;
import com.pitlane.pitlane.service.VehiclesService;
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
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for VehicleController.
 * Tests cover CRUD operations, mileage update and response format.
 * Security tests are covered by SecurityIntegrationTest.
 * The VehiclesService is mocked to isolate the controller layer from business logic.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VehiclesService vehiclesService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuthTokenFilter authTokenFilter;

    private User user;
    private UUID vehicleId;

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

    // ─── GET /api/vehicles ────────────────────────────────────────────────────

    /**
     * Authenticated request to get all vehicles should return 200 with the vehicle list
     */
    @Test
    @WithMockPitlaneUser
    void getAllVehicles_authenticated_returns200WithList() throws Exception {
        VehicleResponseDto vehicle = VehicleResponseDto.builder()
                .id(vehicleId)
                .brand("Honda")
                .model("Civic")
                .year((short) 1998)
                .currentMileage(100000)
                .alertStatus("NONE")
                .build();

        when(vehiclesService.getUserVehicles(any(User.class))).thenReturn(List.of(vehicle));

        mockMvc.perform(get("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].brand").value("Honda"))
                .andExpect(jsonPath("$[0].model").value("Civic"));
    }

    /**
     * Authenticated request with no vehicles should return 200 with empty list
     */
    @Test
    @WithMockPitlaneUser
    void getAllVehicles_noVehicles_returns200WithEmptyList() throws Exception {
        when(vehiclesService.getUserVehicles(any(User.class))).thenReturn(List.of());

        mockMvc.perform(get("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ─── GET /api/vehicles/{id} ───────────────────────────────────────────────

    /**
     * Authenticated request to get a vehicle detail should return 200 with the vehicle info
     */
    @Test
    @WithMockPitlaneUser
    void getVehicle_authenticated_returns200WithDetail() throws Exception {
        VehicleDetailResponseDTO detail = VehicleDetailResponseDTO.builder()
                .brand("Honda")
                .model("Civic")
                .year((short) 1998)
                .mileage("100000")
                .nrActiveAlerts((short) 0)
                .totalMaintenances((short) 3)
                .totalCosts(22500)
                .totalAlerts((short) 1)
                .alerts(List.of())
                .maintenances(List.of())
                .lastUpdated(LocalDateTime.now())
                .build();

        when(vehiclesService.getUserVehicle(eq(vehicleId), any(User.class))).thenReturn(Optional.of(detail));

        mockMvc.perform(get("/api/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Honda"))
                .andExpect(jsonPath("$.totalCosts").value(22500));
    }

    /**
     * Requesting a vehicle that does not belong to the user should return empty optional — 200 with null body
     */
    @Test
    @WithMockPitlaneUser
    void getVehicle_notFound_returns200WithEmpty() throws Exception {
        when(vehiclesService.getUserVehicle(eq(vehicleId), any(User.class))).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ─── PATCH /api/vehicles/{id}/mileage ────────────────────────────────────

    /**
     * Authenticated request to update mileage should return 200 with the new mileage
     */
    @Test
    @WithMockPitlaneUser
    void updateMileage_authenticated_returns200WithNewMileage() throws Exception {
        when(vehiclesService.setNewMileage(eq(vehicleId), any(User.class), eq(110000))).thenReturn(110000);

        mockMvc.perform(patch("/api/vehicles/{id}/mileage", vehicleId)
                        .param("newMileage", "110000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("110000"));
    }

    // ─── PATCH /api/vehicles/{id} ─────────────────────────────────────────────

    /**
     * Authenticated request to update vehicle info should return 200 with updated data
     */
    @Test
    @WithMockPitlaneUser
    void updateVehicle_authenticated_returns200WithUpdatedData() throws Exception {
        UpdateVehicleDto dto = new UpdateVehicleDto();
        dto.setVehicleId(vehicleId);
        dto.setBrand("Toyota");
        dto.setModel("Corolla");
        dto.setYear((short) 2020);
        dto.setPlate("AA-00-BB");

        when(vehiclesService.updateVehicle(any(User.class), any(UpdateVehicleDto.class))).thenReturn(dto);

        mockMvc.perform(patch("/api/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Corolla"));
    }
}
