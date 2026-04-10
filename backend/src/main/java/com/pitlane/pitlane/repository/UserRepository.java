package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Finds the user by email, the main identifier for a created account
     * @param email The unique email of the user
     * @return Returns a user if it exists
     */
    Optional<User> findByEmail(String email);

    /**
     * Validates if a user with the provided email exists in the database
     * @param username The unique email of the user
     * @return True if the account exists
     */
    boolean existsByEmail(String username);
}
