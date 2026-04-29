package com.pitlane.pitlane.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A Dto created to register the user */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

    /** The display name of the account */
    @NotBlank(message = "Name is required")
    private String displayName;

    /** The email used to create the account */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /** The account password */
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
