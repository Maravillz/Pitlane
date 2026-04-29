import type { ReactNode } from 'react'
import {useLocation, Navigate, NavLink} from 'react-router-dom'
import Navbar from './Navbar/Navbar.tsx'
import BottomNav from './BottomNav.tsx'
import { useAuth } from '../../hooks/useAuth.ts'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

/**
 * Represents que main content HTML the controls nav bars and the remaining content
 * @param children The react nodes inside the wrapper
 * @constructor
 */
const PageWrapper = ({ children }: { children: ReactNode }) => {
    const { pathname } = useLocation()
    const { isAuthenticated } = useAuth()
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    const navLinks = [
        {
            name: "Garagem",
            path: "/dashboard",
            isActive: pathname.toLowerCase() == "/dashboard"
        },
        {
            name: "Alertas",
            path: "/alerts",
            isActive: pathname.toLowerCase() == "/alerts"
        },
        {
            name: "Custos",
            path: "/costs",
            isActive: pathname.toLowerCase() == "/costs"
        }
    ]

    if (!isPublic && !isAuthenticated) {
        return <Navigate to="/login" />
    }

    return (
        <div className="flex">
            <div className="hidden md:flex w-2/17 flex-col bg-[#1a1a1a] h-screen top-0 left-0 p-3 gap-2">
                <h1 className="text-[#f5a623] text-4xl font-bold px-3 py-2 mb-2">Pitlane</h1>
                {
                    navLinks.map((link) => {
                        return <NavLink className={`${link.isActive ? "text-[#f5a623] bg-[#2a2a2a]" : ""} hover:text-[#f5a623] hover:bg-[#2a2a2a] text-[#888] rounded-xl text-xl mx-2 px-4 py-3`} to={link.path}>{link.name}</NavLink>
                    })
                }
            </div>
            <Navbar />
            <main className="md:top-0 md:h-auto md:relative top-[9%] absolute h-[82%] w-full overflow-auto px-6 py-4">
                {children}
            </main>
                {/* If the user is not yet authenticated the bottom bar is excluded due to its nav items */}
                {isAuthenticated ? <BottomNav /> : <></>}
        </div>
    )
}

export default PageWrapper