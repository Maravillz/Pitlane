package com.pitlane.pitlane.dto;

import lombok.AllArgsConstructor;
import lombok.Data;


/** DTO used to transmit the token */
@Data
@AllArgsConstructor
public class AuthResponseDto {

    /** The token used to authenticate in the app */
    private String token;
}