import {useEffect, useState} from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContextType'
import type {UserResponse} from "../models/auth.ts";
import {authService} from "../services/authService.ts";

/**
 * Auth provider to wrap the components as an authentication layer
 * @param children The react nodes of the components inside the auth wrapper
 * @constructor
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
    const [user, setUser] = useState<UserResponse | null>(null)

    const isAuthenticated = token !== null

    useEffect(() => {
        if (token) {
            authService.userInfo()
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem('token')
                    setToken(null)
                })
        }
    }, [token])

    /**
     * Log in method to set the token in the local storage and the auth user to be consulted
     * @param token The auth token
     * @param user The user logged in
     */
    const login = (token: string, user: UserResponse) => {
        localStorage.setItem('token', token)
        setToken(token)
        setUser(user)
    }

    /**
     * Logs out the user by removing the token and the logged user
     */
    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}