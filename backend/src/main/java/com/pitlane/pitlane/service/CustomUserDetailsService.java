package com.pitlane.pitlane.service;

import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** User Detail Service */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    /** User Repository */
    private final UserRepository userRepository;

    /**
     * Override method that gets user by its username
     * @param username The username unique that identifies the user
     * @return Returns the user details
     * @throws UsernameNotFoundException Throws an exception if the user is not found
     */
    @Override
    public User loadUserByUsername(String username)  throws UsernameNotFoundException{
        return userRepository.findByEmail(username)
                .orElseThrow( () -> new UsernameNotFoundException("User Not Found with username: " + username));
    }
}
