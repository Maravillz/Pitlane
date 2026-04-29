package com.pitlane.pitlane.service;

import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Unit tests for CustomUserDetailsService.
 * Tests cover user lookup by email used by Spring Security during authentication.
 * The UserRepository is mocked to isolate the service logic from the database.
 */
@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@pitlane.com")
                .displayName("Test User")
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ─── loadUserByUsername ───────────────────────────────────────────────────

    /**
     * Loading a user by an email that exists should return the user details
     */
    @Test
    void loadUserByUsername_existingEmail_returnsUser() {
        when(userRepository.findByEmail("test@pitlane.com")).thenReturn(Optional.of(user));

        User result = (User) customUserDetailsService.loadUserByUsername("test@pitlane.com");

        assertThat(result.getEmail()).isEqualTo("test@pitlane.com");
        assertThat(result.getDisplayName()).isEqualTo("Test User");
    }

    /**
     * Loading a user by an email that does not exist should throw UsernameNotFoundException
     * This is the standard Spring Security exception for failed authentication lookups
     */
    @Test
    void loadUserByUsername_nonExistentEmail_throwsUsernameNotFoundException() {
        when(userRepository.findByEmail("nonexistent@pitlane.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("nonexistent@pitlane.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("nonexistent@pitlane.com");
    }

    /**
     * The returned user details must implement the Spring Security UserDetails contract
     * — getUsername must return the email used to identify the account
     */
    @Test
    void loadUserByUsername_returnsUserWithCorrectUsername() {
        when(userRepository.findByEmail("test@pitlane.com")).thenReturn(Optional.of(user));

        User result = (User) customUserDetailsService.loadUserByUsername("test@pitlane.com");

        assertThat(result.getUsername()).isEqualTo("test@pitlane.com");
    }

    /**
     * The returned user details must have an empty authorities list
     * as role-based access control is not implemented in this project phase
     */
    @Test
    void loadUserByUsername_returnsUserWithEmptyAuthorities() {
        when(userRepository.findByEmail("test@pitlane.com")).thenReturn(Optional.of(user));

        User result = (User) customUserDetailsService.loadUserByUsername("test@pitlane.com");

        assertThat(result.getAuthorities()).isEmpty();
    }
}