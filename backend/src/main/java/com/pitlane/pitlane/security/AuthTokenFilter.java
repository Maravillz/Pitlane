package com.pitlane.pitlane.security;

import com.pitlane.pitlane.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtils;

    private final CustomUserDetailsService userDetailsService;


    /**
     * Overrides the abstract method doFilterInternal with our validation.
     * The reason to extend the class is due to the parent class already guarantees the code is executed one time per request which optimizes the processing time
     * @param request The request object following the chain
     * @param response The response object following the chain
     * @param filterChain The current filter chain so we can advance to the nest step
     * @throws ServletException Throws an exception if it finds and error processing the http request
     * @throws IOException Throws an exception if it finds an error writing the response
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,@NonNull FilterChain filterChain)  throws ServletException, IOException{
        try{
            String jwt = parseJwt(request);
            if(jwt != null && jwtUtils.validateJwtToken(jwt)){
                String username = jwtUtils.getUsernameFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            System.out.println("Cannot set user authentication: " + e);
        }
        filterChain.doFilter(request, response);
    }

    /**
     * A Jwt parser that extract the jwt token from the authentication string Bearer ...
     * @param request The complete request
     * @return The complete token
     */
    private String parseJwt(HttpServletRequest request){
        String headerAuth = request.getHeader("Authorization");
        if(headerAuth != null && headerAuth.startsWith("Bearer ")){
            return headerAuth.substring(7);
        }
        return null;
    }
}
