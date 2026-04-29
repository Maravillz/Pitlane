package com.pitlane.pitlane.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Custom authentication error class */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    /**
     * Processes a call from the Spring if it finds and error authenticating instead of throwing a generic error
     * @param request The request being processed
     * @param response The response to the request
     * @param authException The exception generated
     * @throws IOException Exception thrown if there is an error writing the response
     */
    @Override
    public void commence (HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }
}
