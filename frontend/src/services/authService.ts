import type {LoginRequest, RegisterRequest, AuthResponse, UserResponse} from "../models/auth"

const API_URL: string = import.meta.env.VITE_API_URL

const login = async (loginInfo: LoginRequest): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo)
    })
    if (!res.ok) throw new Error('Invalid credentials')
    return res.json()
}

const register = async (registerInfo: RegisterRequest): Promise<AuthResponse> => {
    const res= await fetch (`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerInfo)
    })
    if (!res.ok) throw new Error('Error registering')
    return res.json()
}

const userInfo = async (): Promise<UserResponse> => {
    const token = localStorage.getItem('token')
    const res= await fetch (`${API_URL}/api/users/user`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    if (!res.ok) throw new Error('Error registering')
    return res.json()
}

const loginWithGoogle = () => {
    window.location.href = `${API_URL}/oauth2/authorization/google`
}

export const authService = { login, register, userInfo, loginWithGoogle }
