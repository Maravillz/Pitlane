package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.AuthResponseDto;
import com.pitlane.pitlane.dto.LoginRequestDto;
import com.pitlane.pitlane.dto.RegisterRequestDto;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.repository.UserRepository;
import com.pitlane.pitlane.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 * Tests cover user registration, login and token generation.
 * External dependencies are mocked to isolate the service logic.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequestDto registerRequest;
    private LoginRequestDto loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequestDto();
        registerRequest.setEmail("test@pitlane.com");
        registerRequest.setPassword("password123");
        registerRequest.setDisplayName("Test User");

        loginRequest = new LoginRequestDto();
        loginRequest.setEmail("test@pitlane.com");
        loginRequest.setPassword("password123");
    }

    // ─── register ────────────────────────────────────────────────────────────

    /**
     * Registering with a new email should create the user and return a token
     */
    @Test
    void register_newEmail_returnsToken() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("hashedPassword");
        when(jwtService.generateToken(registerRequest.getEmail())).thenReturn("jwt-token");

        AuthResponseDto result = authService.register(registerRequest);

        assertThat(result.getToken()).isEqualTo("jwt-token");
        verify(userRepository).save(any(User.class));
    }

    /**
     * Registering with an email that already exists should throw an exception without saving
     */
    @Test
    void register_duplicateEmail_throwsException() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already in use");

        verify(userRepository, never()).save(any());
    }

    /**
     * The password should be hashed before being saved — never stored in plain text
     */
    @Test
    void register_passwordIsHashed_beforeSaving() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$hashedPassword");
        when(jwtService.generateToken(any())).thenReturn("jwt-token");

        authService.register(registerRequest);

        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(argThat(user ->
                user.getPasswordHash().equals("$2a$hashedPassword")
        ));
    }

    // ─── login ───────────────────────────────────────────────────────────────

    /**
     * Login with valid credentials should return a token
     */
    @Test
    void login_validCredentials_returnsToken() {
        when(jwtService.generateToken(loginRequest.getEmail())).thenReturn("jwt-token");

        AuthResponseDto result = authService.login(loginRequest);

        assertThat(result.getToken()).isEqualTo("jwt-token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    /**
     * Login with invalid credentials should propagate the exception from the authentication manager
     */
    @Test
    void login_invalidCredentials_throwsException() {
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);

        verify(jwtService, never()).generateToken(any());
    }
}