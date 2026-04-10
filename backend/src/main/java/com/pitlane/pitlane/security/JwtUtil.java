package com.pitlane.pitlane.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    //The secret string used to encrypt the keys, the secret cannot be shared
    @Value("${jwt.secret}")
    private String jwtSecret;

    //The time in ms the token will be valid for
    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    //The encrypted key used to sign the requests to prove authenticity
    private SecretKey key;

    /**
     * Initializer that creates a encrypted key to sign the requests when the class is initialized, creating the key once
     */
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a token for the user using the secret
     * @param username The username of the logged user
     * @return The token generated for the user
     */
    public String generateToken (String username){
        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }

    /**
     * Extracts the username from the payload of the given token
     * @param token The given token
     * @return The username extracted from the token payload
     */
    public String getUsernameFromToken(String token){
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Uses the bult-in validation to catch any errors with the token and uses try/catch to make custom messages based on the validation error thrown
     * @param token The token that is being validated
     * @return Returns true if the token is valid
     */
    public boolean validateJwtToken(String token){
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (SecurityException e) {
            System.out.println("Invalid JWT signature: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.out.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }
}

























