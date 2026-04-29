package com.pitlane.pitlane.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/** Dto to represent the return of the user information */
@Data
@AllArgsConstructor
public class UserResponseDto {

    /** The user display name */
    private String displayName;

    /** The user email */
    private String email;
}
