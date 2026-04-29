package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.*;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** User Controller */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    /**
     * Gives info about the account for the profile page
     * @param user The user logged
     * @return A DTO with the user information
     */
    @GetMapping("me")
    public ResponseEntity<UserResponseDto> getUserInfo(@AuthenticationPrincipal User user){
        return ResponseEntity.ok().body(new UserResponseDto(user.getDisplayName(), user.getEmail()));
    }
}
