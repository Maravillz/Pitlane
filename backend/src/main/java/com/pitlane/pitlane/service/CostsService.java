package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.CostsSummaryDto;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import com.pitlane.pitlane.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/** The service that contains the logic for the dashboards */
@Service
@RequiredArgsConstructor
public class CostsService {

    /** Vehicle Repository */
    private final VehicleRepository vehicleRepository;

    /**
     * Calculates the costs grouped by category and by vehicles, filtering by the period selected by the user
     * @param user The user that made de request
     * @param period The time interval the costs are considered
     * @return A DTO with the values for the categories costs and vehicle costs
     */
    @Transactional
    public CostsSummaryDto getCostsSummary(User user, String period) {

        List<Vehicle> userVehicles = vehicleRepository.findAllByUser(user);

        List<Maintenance> validMaintenances = userVehicles.stream()
                .flatMap(v -> v.getMaintenances().stream())
                .filter(m -> m.getCostCents() != null)
                .filter(m -> filterByPeriod(m, period))
                .toList();

        int totalCosts = validMaintenances.stream().mapToInt(Maintenance::getCostCents).sum();

        List<CostsSummaryDto.CategoryCostDto> costsByCategory = validMaintenances.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getType().name(),
                        Collectors.summingInt(Maintenance::getCostCents)
                ))
                .entrySet().stream()
                .map(e -> CostsSummaryDto.CategoryCostDto.builder()
                        .category(e.getKey())
                        .totalCents(e.getValue())
                        .percentage(totalCosts > 0 ? (int) Math.round((e.getValue() * 100.0) / totalCosts) : 0)
                        .build())
                .sorted(Comparator.comparingInt(CostsSummaryDto.CategoryCostDto::getTotalCents).reversed())
                .toList();

        List<CostsSummaryDto.VehicleCostDto> costsByVehicle = userVehicles.stream()
                .map(v -> {

                    int vehicleTotalCost = v.getMaintenances().stream()
                            .filter(m -> m.getCostCents() != null)
                            .filter(m -> filterByPeriod(m, period))
                            .mapToInt(Maintenance::getCostCents)
                            .sum();
                    return CostsSummaryDto.VehicleCostDto.builder()
                            .vehicleId(v.getId())
                            .vehicleName(v.getBrand() + " " + v.getModel())
                            .totalCents(vehicleTotalCost)
                            .percentage(totalCosts > 0 ? (int) Math.round((vehicleTotalCost * 100.0) / totalCosts) : 0)
                            .build();
                })
                .filter(v -> v.getTotalCents() > 0)
                .sorted(Comparator.comparingInt(CostsSummaryDto.VehicleCostDto::getTotalCents).reversed())
                .toList();

        return CostsSummaryDto.builder()
                .totalCents(totalCosts)
                .byCategory(costsByCategory)
                .byVehicle(costsByVehicle)
                .build();
    }

    /**
     * Method used to filter out maintenances that have not occurred on the specified period (month/year/ever)
     * @param m The maintenance being filtered
     * @param period The period selected by the user in the frontend
     * @return true if the maintenance is from the selected period
     */
    private boolean filterByPeriod(Maintenance m, String period) {
        LocalDate now = LocalDate.now();
        switch (period) {
            case "month":
               return m.getDate().getMonth() == now.getMonth() && m.getDate().getYear() == now.getYear();
            case "year":
                return m.getDate().getYear() == now.getYear();
            default:
                return true;
        }
    }
}
