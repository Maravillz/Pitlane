package com.pitlane.pitlane.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Dto with the information to log in a user */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDto {

    /** The email to log in, can't be empty and needs to match the email format */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /** The password required to log in */
    @NotBlank(message = "Password is required")
    private String password;
}