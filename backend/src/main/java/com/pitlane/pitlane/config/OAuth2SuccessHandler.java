package com.pitlane.pitlane.config;

import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.repository.UserRepository;
import com.pitlane.pitlane.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor //Since the class is forced to be created with all the fields instantiated, there is no need to use the annotation @AutoWired
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    private final JwtUtil jwtService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Method to authenticate oAuth accounts that is inserted in the chain on the file WebSecurityConfig
     * @param request The Request on the chain
     * @param response The response built for the request
     * @param authentication The authentication object containing the user data
     * @throws IOException Throws an exception if it finds an error while building the response
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Creates the user if it does not exist
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .displayName(name)
                                .passwordHash("") // sem password — autenticação via Google
                                .createdAt(LocalDateTime.now())
                                .build()
                ));

        String token = jwtService.generateToken(user.getEmail());

        // Redirects to the frontend with the token
        String redirectUrl = frontendUrl + "/auth/callback"
                + "?token=" + token;

        response.sendRedirect(redirectUrl);
    }
}
