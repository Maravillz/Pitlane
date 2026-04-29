package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.AlertResponseDto;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** Alert Controller */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/alerts")
public class AlertController {

    /** Alert Service */
    private final AlertService alertService;

    /**
     * Gets all the alerts, pending or resolved, for the logged user
     * @param user The user that made the request
     * @return A list with a DTO that has the information for the alerts page
     */
    @GetMapping("")
    public ResponseEntity<List<AlertResponseDto>> getUserAlerts(@AuthenticationPrincipal User user){
        return ResponseEntity.ok().body(alertService.getAlertsByUser(user));
    }

    /**
     * Marks an alert as resolved and associates the time of the request as the resolved time
     * @param id The id of the unresolved alert that is pending to be resolved
     * @param user The user that made the request
     * @return Ok without body to signal the operation was successful
     */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Void> resolveAlert(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        alertService.resolveAlert(id, user);
        return ResponseEntity.ok().build();
    }
}
