package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.AuthResponseDto;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.service.DemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Demo Controller — temp account creation and session end */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/demo")
public class DemoController {

    private final DemoService demoService;

    /**
     * Creates a temporary demo account with copied data and returns a 2h JWT token.
     * Public endpoint — no authentication required.
     */
    @PostMapping("/session/start")
    public ResponseEntity<AuthResponseDto> startDemoSession() {
        return ResponseEntity.ok(demoService.createDemoSession());
    }

    /**
     * Ends the demo session and deletes the temp user and all associated data.
     * Requires authentication — called with the demo user's token.
     */
    @PostMapping("/session/end")
    public ResponseEntity<Void> endDemoSession(@AuthenticationPrincipal User user) {
        demoService.endDemoSession(user);
        return ResponseEntity.ok().build();
    }
}
