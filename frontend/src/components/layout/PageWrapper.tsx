import type { ReactNode } from 'react'
import {useLocation, Navigate, NavLink, Link} from 'react-router-dom'
import Navbar from './Navbar/Navbar.tsx'
import BottomNav from './BottomNav.tsx'
import { useAuth } from '../../hooks/useAuth.ts'
import { HomeIcon as HomeIconSolid, BellIcon as BellIconSolid, CurrencyEuroIcon as CurrencyEuroIconSolid } from '@heroicons/react/24/solid'
import {BellIcon, CurrencyEuroIcon, HomeIcon} from "@heroicons/react/16/solid";

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
    const isDemo = localStorage.getItem('isDemo') === 'true'
    const navLinks = [
        {
            name: "Garagem",
            path: "/dashboard",
            icon: HomeIcon,
            iconActive: HomeIconSolid,
            isActive: pathname.toLowerCase() === '/dashboard'
        },
        {
            name: "Alertas",
            path: "/alerts",
            icon: BellIcon,
            iconActive: BellIconSolid,
            isActive: pathname.toLowerCase() === '/alerts'
        },
        {
            name: "Custos",
            path: "/costs",
            icon: CurrencyEuroIcon,
            iconActive: CurrencyEuroIconSolid,
            isActive: pathname.toLowerCase() === '/costs'
        }
    ]

    if (!isPublic && !isAuthenticated) {
        return <Navigate to="/login" />
    }

    return (
        <div className="flex min-h-screen bg-bg-page">

            {/* Sidebar — desktop only */}
            {isAuthenticated && (
                <aside className="hidden md:flex flex-col w-56 fixed top-0 left-0 h-full bg-bg-card border-r border-border z-40">
                    <div className="px-6 py-6 mb-2">
                        <span className="text-brand font-black text-2xl tracking-tight">Pitlane</span>
                    </div>

                    <nav className="flex flex-col gap-1 px-3 flex-1">
                        {navLinks.map(link => {
                            const Icon = link.isActive ? link.iconActive : link.icon
                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                        ${link.isActive
                                        ? 'bg-brand/10 text-brand'
                                        : 'text-text-secondary hover:bg-border hover:text-text-primary'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {link.name}
                                </NavLink>
                            )
                        })}
                    </nav>

                    <div className="px-3 py-4 border-t border-border">
                        <p className="text-xs text-text-muted px-4">v1.0.0</p>
                    </div>
                </aside>
            )}

            <div className={`${isAuthenticated ? 'md:ml-56' : ''} flex-1 flex flex-col min-h-screen`}>

                {/* Demo banner */}
                {isDemo && isAuthenticated && (
                    <div className="bg-brand/10 border-b border-brand/20 px-5 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand animate-pulse flex-shrink-0" />
                            <span className="text-brand text-xs font-medium">
                                Modo demonstração — dados fictícios para ilustrar a app
                            </span>
                        </div>
                        <Link
                            to="/register"
                            className="text-brand text-xs font-bold whitespace-nowrap hover:underline flex-shrink-0"
                        >
                            Criar conta grátis →
                        </Link>
                    </div>
                )}

                <Navbar />

                <main className={`
                    flex-1 overflow-auto px-5 py-5
                    ${isAuthenticated ? 'pb-24 md:pb-8' : ''}
                    md:px-10 md:py-8
                `}>
                    {children}
                </main>
            </div>

            {/* BottomNav — mobile only */}
            {isAuthenticated && (
                <div className="md:hidden">
                    <BottomNav />
                </div>
            )}
        </div>
    )
}

export default PageWrapper