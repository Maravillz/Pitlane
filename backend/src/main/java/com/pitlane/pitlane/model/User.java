package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data //Creates getters, setters, equals, hashCode and toString
@AllArgsConstructor //Creates a constructor with all the fields as parameters
@NoArgsConstructor //Creates a constructor without parameters
@Entity //Signals this is a database entity
@Builder //Allows to use a builder for this class which allows to make a custom object with specific fields filled
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = true) //The password is nullable due to the login related to Google Registers
    private String passwordHash;

    @Column(name = "avatar_url", nullable = true)
    private String avatarUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    //Spring Security UserDetails Implementation
    /**
     * Returns a list of permission roles for the account, returning empty due to roles not being implemented this project phase
     * @return Returns an empty list
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    /**
     * Overrides the method to return the account password to instead return custom passwordHash field
     * @return The password hash
     */
    @Override
    public String getPassword() {
        return passwordHash;
    }

    /**
     * Overrides the method to return the account username to instead return email field used to identify the account
     * @return The user email as the username
     */
    @Override
    public String getUsername() {
        return email;
    }
}
