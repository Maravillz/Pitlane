import { createContext } from 'react'
import type {UserResponse} from "../models/auth.ts";

export interface AuthContextType {
    user: UserResponse | null
    token: string | null
    isAuthenticated: boolean
    login: (token: string, user: UserResponse) => void
    logout: () => void
}

/** Auth context to extract information about the user authenticated */
export const AuthContext = createContext<AuthContextType | null>(null)