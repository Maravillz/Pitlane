/** The login information */
export interface LoginRequest {
    email: string
    password: string
}

/** The register information */
export interface RegisterRequest {
    email: string
    password: string
    displayName: string
}

/** The token response to the login */
export interface AuthResponse {
    token: string
}

/** The user information for the profile page */
export interface UserResponse {
    displayName: string
    email: string
}
