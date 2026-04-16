package com.pitlane.pitlane.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseDto {
    private String displayName;
    private String email;
}
