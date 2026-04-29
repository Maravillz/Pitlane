package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.AuthResponseDto;
import com.pitlane.pitlane.dto.LoginRequestDto;
import com.pitlane.pitlane.dto.RegisterRequestDto;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.repository.UserRepository;
import com.pitlane.pitlane.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/** Auth Service */
@Service
@RequiredArgsConstructor
public class AuthService {

    /** User Repository */
    private final UserRepository userRepository;

    /** The utility service to manage the token creation */
    private final JwtUtil jwtService;

    /** The password encoder */
    private final PasswordEncoder passwordEncoder;

    /** The authentication manager */
    private final AuthenticationManager authenticationManager;

    /**
     * Processes the register request by checking if the user already exists and if not creates one.
     * Since the token is not stored in the BD, @Transaction is not used since only one communication with the DB is made.
     * In the future add the tag if that changes.
     * To streamline the process, a token is generated to instantly login the user when the account is created since there isn't email confirmation for now.
     * @param request The Request DTO with the credentials to register
     * @return The token as a DTO, this allows it to scale to multiple token when needed
     */
    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .displayName(request.getDisplayName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return new AuthResponseDto(jwtService.generateToken(user.getEmail()));
    }

    /**
     * Processes the login request by using the authentication manager, checking if the user exists and if the credentials are valid
     * @param request The Request DTO with the credentials to login
     * @return The token as a DTO, this allows it to scale to multiple token when needed
     */
    public AuthResponseDto login(LoginRequestDto request) {
        // The AuthenticationManager validates the credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        return new AuthResponseDto(jwtService.generateToken(request.getEmail()));
    }
}
