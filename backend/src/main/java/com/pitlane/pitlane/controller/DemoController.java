package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.service.DemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Demo Controller — session tracking and logout reset */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/demo")
public class DemoController {

    private final DemoService demoService;

    /**
     * Called when someone clicks "Ver demonstração" — starts a new session
     */
    @PostMapping("/session/start")
    public ResponseEntity<Void> startSession() {
        demoService.startSession();
        return ResponseEntity.ok().build();
    }

    /**
     * Called when the demo user logs out — ends the session and resets data immediately
     */
    @PostMapping("/session/end")
    public ResponseEntity<Void> endSession() {
        demoService.endSession();
        return ResponseEntity.ok().build();
    }
}
