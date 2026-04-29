package com.pitlane.pitlane.config;

import org.springframework.security.test.context.support.WithSecurityContext;
import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockPitlaneUserSecurityContextFactory.class)
public @interface WithMockPitlaneUser {
    String email() default "test@pitlane.com";
    String displayName() default "Test User";
}