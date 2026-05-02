package com.pitlane.pitlane.config;

import com.pitlane.pitlane.security.AuthEntryPointJwt;
import com.pitlane.pitlane.security.AuthTokenFilter;
import com.pitlane.pitlane.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/** The configuration to the authentication and layered security */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    /** The class to treat unauthorized exceptions */
    private final AuthEntryPointJwt unauthorizedHandler;

    /** OAuth Authenticator */
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    /** User Service */
    private final CustomUserDetailsService userDetailsService;

    /** The class to authenticate the token, replacing the one on the chain */
    private final AuthTokenFilter authTokenFilter;

    /** The url frontend in the app.properties */
    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Method to obtain the authentication manager to process authentications
     * @param authenticationConfiguration The configured authenticator for the app
     * @return The authentication manager
     * @throws Exception Throws an exception if it find any error getting the authentication manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Gets a password encoder method
     * @return A password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cors configuration that allows to replace the default Cors setup allowing more control. Excludes /swagger-ui/** and /v3/api-docs/**, due to it being disabled in production.
     * @return The Cors configuration for the project
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "https://pitlaneapp.net",
                "https://www.pitlaneapp.net",
                "https://pitlane-blush.vercel.app",
                "http://localhost:5173",
                "capacitor://localhost",
                "http://localhost"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    /**
     * Overrides the spring security filter chain to make authentications with a token
     * Disables the default login screen of spring security, consider the access valid with the token
     * @param http The HTTP security builder used to configure the security filter chain
     * @return The chain with the auth information filled if the account is approved
     * @throws Exception Throws an exception if the authorization is not filled with valid data to continue the chain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Disable CSRF
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exceptionHandling ->
                    exceptionHandling.authenticationEntryPoint(unauthorizedHandler)
            )
            .sessionManagement(sessionManagement ->
                    sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers("/api/auth/**", "/api/test/all", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                                .anyRequest().authenticated()
                )
            .oauth2Login(oauth2 -> oauth2
                    .successHandler(oAuth2SuccessHandler)
            )
                    .userDetailsService(userDetailsService);

        // Add the JWT Token filter before the UsernamePasswordAuthenticationFilter
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
