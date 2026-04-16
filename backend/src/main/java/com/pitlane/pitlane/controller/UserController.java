package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.AuthResponseDto;
import com.pitlane.pitlane.dto.LoginRequestDto;
import com.pitlane.pitlane.dto.RegisterRequestDto;
import com.pitlane.pitlane.dto.UserResponseDto;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/user")
    public ResponseEntity<UserResponseDto> getUserInfo(@AuthenticationPrincipal User user){
        return ResponseEntity.ok().body(new UserResponseDto(user.getDisplayName(), user.getEmail()));
    }
}
