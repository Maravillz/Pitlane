import { useContext } from 'react'
import { AuthContext } from '../context/AuthContextType.tsx'

/** Return the context we built for the auth */
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}