package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.AuthResponseDto;
import com.pitlane.pitlane.dto.LoginRequestDto;
import com.pitlane.pitlane.dto.RegisterRequestDto;
import com.pitlane.pitlane.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    /**
     * Routing that allows the user to login
     * @param request Request from the user to login
     * @return The token to authenticate the next requests
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> authenticateUser(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok().body(authService.login(request));
    }

    /**
     * Routing that allows the user to register
     * @param request Request from the user to register
     * @return The token to authenticate the next requests
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequestDto request) {
        return ResponseEntity.ok().body(authService.register(request));
    }
}
