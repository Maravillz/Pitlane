package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.CostsSummaryDto;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import com.pitlane.pitlane.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Unit tests for CostsService.
 * Tests cover cost aggregation by category, cost aggregation by vehicle,
 * period filtering and percentage calculation.
 * The vehicle repository is mocked to isolate the service logic from the database.
 */
@ExtendWith(MockitoExtension.class)
class CostsServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private CostsService costsService;

    private User user;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@pitlane.com")
                .displayName("Test User")
                .createdAt(LocalDateTime.now())
                .build();

        vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .user(user)
                .brand("Honda")
                .model("Civic")
                .year((short) 1998)
                .currentMileage(100000)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ─── getCostsSummary ─────────────────────────────────────────────────────

    /**
     * User with no vehicles should return a summary with zero costs and empty lists
     */
    @Test
    void getCostsSummary_noVehicles_returnsZeroCosts() {
        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of());

        CostsSummaryDto result = costsService.getCostsSummary(user, "total");

        assertThat(result.getTotalCents()).isZero();
        assertThat(result.getByCategory()).isEmpty();
        assertThat(result.getByVehicle()).isEmpty();
    }

    /**
     * Total costs should be the sum of all maintenance costs in cents across all vehicles
     */
    @Test
    void getCostsSummary_withMaintenances_calculatesTotalCorrectly() {
        Maintenance m1 = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 4500, LocalDate.now());
        Maintenance m2 = buildMaintenance(Maintenance.MaintenanceType.BRAKE_SERVICE, 18000, LocalDate.now());
        vehicle.setMaintenances(List.of(m1, m2));

        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));

        CostsSummaryDto result = costsService.getCostsSummary(user, "total");

        assertThat(result.getTotalCents()).isEqualTo(22500);
    }

    /**
     * Costs should be grouped by maintenance type and sorted from most expensive to least expensive
     */
    @Test
    void getCostsSummary_groupsByCategory_sortedByHighestCost() {
        Maintenance m1 = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 4500, LocalDate.now());
        Maintenance m2 = buildMaintenance(Maintenance.MaintenanceType.BRAKE_SERVICE, 18000, LocalDate.now());
        vehicle.setMaintenances(List.of(m1, m2));

        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));

        CostsSummaryDto result = costsService.getCostsSummary(user, "total");

        assertThat(result.getByCategory()).hasSize(2);
        assertThat(result.getByCategory().get(0).getTotalCents()).isGreaterThan(
                result.getByCategory().get(1).getTotalCents()
        );
        assertThat(result.getByCategory().get(0).getCategory()).isEqualTo("BRAKE_SERVICE");
    }

    /**
     * Percentages should sum to 100 when there are multiple categories
     */
    @Test
    void getCostsSummary_percentages_sumToHundred() {
        Maintenance m1 = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 5000, LocalDate.now());
        Maintenance m2 = buildMaintenance(Maintenance.MaintenanceType.BRAKE_SERVICE, 5000, LocalDate.now());
        vehicle.setMaintenances(List.of(m1, m2));

        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));

        CostsSummaryDto result = costsService.getCostsSummary(user, "total");

        int totalPercentage = result.getByCategory().stream()
                .mapToInt(CostsSummaryDto.CategoryCostDto::getPercentage)
                .sum();

        assertThat(totalPercentage).isEqualTo(100);
    }

    /**
     * Period filter "month" should only include maintenances from the current month and year
     */
    @Test
    void getCostsSummary_monthFilter_onlyIncludesCurrentMonth() {
        Maintenance thisMonth = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 4500, LocalDate.now());
        Maintenance lastMonth = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 9000, LocalDate.now().minusMonths(1));
        vehicle.setMaintenances(List.of(thisMonth, lastMonth));

        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));

        CostsSummaryDto result = costsService.getCostsSummary(user, "month");

        assertThat(result.getTotalCents()).isEqualTo(4500);
    }

    /**
     * Period filter "year" should only include maintenances from the current year
     */
    @Test
    void getCostsSummary_yearFilter_onlyIncludesCurrentYear() {
        Maintenance thisYear = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 4500, LocalDate.now());
        Maintenance lastYear = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 9000, LocalDate.now().minusYears(1));
        vehicle.setMaintenances(List.of(thisYear, lastYear));

        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));

        CostsSummaryDto result = costsService.getCostsSummary(user, "year");

        assertThat(result.getTotalCents()).isEqualTo(4500);
    }

    /**
     * Maintenances without a cost value should be excluded from all calculations
     */
    @Test
    void getCostsSummary_maintenanceWithNullCost_isExcluded() {
        Maintenance withCost = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 4500, LocalDate.now());
        Maintenance withoutCost = buildMaintenance(Maintenance.MaintenanceType.BRAKE_SERVICE, null, LocalDate.now());
        vehicle.setMaintenances(List.of(withCost, withoutCost));

        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));

        CostsSummaryDto result = costsService.getCostsSummary(user, "total");

        assertThat(result.getTotalCents()).isEqualTo(4500);
        assertThat(result.getByCategory()).hasSize(1);
    }

    /**
     * Vehicles with zero costs in the selected period should be excluded from the by vehicle list
     */
    @Test
    void getCostsSummary_vehicleWithZeroCost_isExcludedFromByVehicle() {
        Vehicle emptyVehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .user(user)
                .brand("Honda")
                .model("CB500F")
                .year((short) 2019)
                .currentMileage(30000)
                .maintenances(List.of())
                .createdAt(LocalDateTime.now())
                .build();

        Maintenance m = buildMaintenance(Maintenance.MaintenanceType.OIL_CHANGE, 4500, LocalDate.now());
        vehicle.setMaintenances(List.of(m));

        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle, emptyVehicle));

        CostsSummaryDto result = costsService.getCostsSummary(user, "total");

        assertThat(result.getByVehicle()).hasSize(1);
        assertThat(result.getByVehicle().getFirst().getVehicleName()).isEqualTo("Honda Civic");
    }

    /** Helper method to build a maintenance with the given type, cost and date */
    private Maintenance buildMaintenance(Maintenance.MaintenanceType type, Integer costCents, LocalDate date) {
        return Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(type)
                .date(date)
                .mileage(100000)
                .costCents(costCents)
                .createdAt(LocalDateTime.now())
                .build();
    }
}