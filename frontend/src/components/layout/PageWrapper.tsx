import type { ReactNode } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import Navbar from './Navbar/Navbar.tsx'
import BottomNav from './BottomNav.tsx'
import { useAuth } from '../../hooks/useAuth.ts'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

const PageWrapper = ({ children }: { children: ReactNode }) => {
    const { pathname } = useLocation()
    const { isAuthenticated } = useAuth()
    const isPublic = PUBLIC_ROUTES.includes(pathname)

    if (!isPublic && !isAuthenticated) {
        return <Navigate to="/login" />
    }

    return (
        <div className="w-full h-full">
            <Navbar />
            <main>
                {children}
            </main>
            {isAuthenticated ? <BottomNav /> : <></>}
        </div>
    )
}

export default PageWrapper