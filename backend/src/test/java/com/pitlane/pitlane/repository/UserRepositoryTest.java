package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for UserRepository using an in-memory H2 database.
 * Tests cover email lookup and existence check used during authentication and registration.
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = entityManager.persist(User.builder()
                .email("test@pitlane.com")
                .displayName("Test User")
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();
    }

    // ─── findByEmail ─────────────────────────────────────────────────────────

    /**
     * Finding a user by an email that exists should return the user
     */
    @Test
    void findByEmail_existingEmail_returnsUser() {
        Optional<User> result = userRepository.findByEmail("test@pitlane.com");

        assertThat(result).isPresent();
        assertThat(result.get().getDisplayName()).isEqualTo("Test User");
    }

    /**
     * Finding a user by an email that does not exist should return empty
     */
    @Test
    void findByEmail_nonExistentEmail_returnsEmpty() {
        Optional<User> result = userRepository.findByEmail("nonexistent@pitlane.com");

        assertThat(result).isEmpty();
    }

    /**
     * Email lookup should be case sensitive — different casing should not match
     */
    @Test
    void findByEmail_differentCase_returnsEmpty() {
        Optional<User> result = userRepository.findByEmail("TEST@PITLANE.COM");

        assertThat(result).isEmpty();
    }

    // ─── existsByEmail ───────────────────────────────────────────────────────

    /**
     * Checking existence for an email that exists should return true
     */
    @Test
    void existsByEmail_existingEmail_returnsTrue() {
        boolean result = userRepository.existsByEmail("test@pitlane.com");

        assertThat(result).isTrue();
    }

    /**
     * Checking existence for an email that does not exist should return false
     */
    @Test
    void existsByEmail_nonExistentEmail_returnsFalse() {
        boolean result = userRepository.existsByEmail("nonexistent@pitlane.com");

        assertThat(result).isFalse();
    }
}