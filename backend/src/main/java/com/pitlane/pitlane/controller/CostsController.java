package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.CostsSummaryDto;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.service.CostsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Costs Controller */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/costs")
public class CostsController {

    /** Costs service */
    private final CostsService costsService;

    /**
     * Generates the info for the costs dashboards specific to the user logged
     * @param user The user logged in the application
     * @param period The period chosen by the user Month/Year/Ever
     * @return Returns a DTO to fill the info with the user costs
     */
    @GetMapping
    public ResponseEntity<CostsSummaryDto> getCosts(@AuthenticationPrincipal User user, @RequestParam(defaultValue = "year") String period) {
        return ResponseEntity.ok(costsService.getCostsSummary(user, period));
    }
}
