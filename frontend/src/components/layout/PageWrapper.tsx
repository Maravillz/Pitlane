import {type ReactNode, useState} from 'react'
import { useLocation, Navigate, NavLink, Link } from 'react-router-dom'
import Navbar from './Navbar/Navbar.tsx'
import BottomNav from './BottomNav.tsx'
import { useAuth } from '../../hooks/useAuth.ts'
import { useTranslation } from 'react-i18next'
import {
    HomeIcon as HomeIconSolid,
    BellIcon as BellIconSolid,
    CurrencyEuroIcon as CurrencyEuroIconSolid
} from '@heroicons/react/24/solid'
import { BellIcon, CurrencyEuroIcon, HomeIcon } from '@heroicons/react/16/solid'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

/**
 * Represents the main content wrapper that controls navbars and the remaining content
 */
const PageWrapper = ({ children }: { children: ReactNode }) => {
    const { pathname } = useLocation()
    const { isAuthenticated } = useAuth()
    const { t, i18n } = useTranslation()
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    const isDemo = localStorage.getItem('isDemo') === 'true'
    const token = localStorage.getItem('token')

    const [showWelcome, setShowWelcome] = useState(() => {
        if (!isDemo || !token) return false
        return !sessionStorage.getItem(`demoWelcomeSeen_${token}`)
    })

    const handleWelcomeDismiss = () => {
        const token = localStorage.getItem('token')
        sessionStorage.setItem(`demoWelcomeSeen_${token}`, 'true')
        setShowWelcome(false)
    }

    const navLinks = [
        {
            name: t('bottomNav.garage'),
            path: '/dashboard',
            icon: HomeIcon,
            iconActive: HomeIconSolid,
            isActive: pathname.toLowerCase() === '/dashboard'
        },
        {
            name: t('bottomNav.alerts'),
            path: '/alerts',
            icon: BellIcon,
            iconActive: BellIconSolid,
            isActive: pathname.toLowerCase() === '/alerts'
        },
        {
            name: t('bottomNav.costs'),
            path: '/costs',
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
                                {t('demo.banner')}
                            </span>
                        </div>
                        <Link
                            to="/register"
                            className="text-brand text-xs font-bold whitespace-nowrap hover:underline flex-shrink-0"
                        >
                            {t('demo.bannerCta')}
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

            {/* ─── Demo Welcome Modal ─────────────────────────────────────────── */}
            {showWelcome && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-bg-card rounded-t-3xl md:rounded-3xl w-full md:max-w-sm border border-border border-b-0 md:border-b overflow-hidden">

                        {/* Language selector */}
                        <div className="flex justify-end px-5 pt-4">
                            <div className="flex bg-bg-page rounded-lg overflow-hidden border border-border">
                                {['en', 'pt'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => i18n.changeLanguage(lang)}
                                        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                                            i18n.language === lang
                                                ? 'bg-brand text-bg-card'
                                                : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-3 flex flex-col gap-5">
                            {/* Header */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                    <span className="text-brand text-xs font-semibold uppercase tracking-widest">
                                        {t('demo.welcomeBadge')}
                                    </span>
                                </div>
                                <h2 className="text-text-primary text-xl font-bold">{t('demo.welcomeTitle')}</h2>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {t('demo.welcomeBody')}
                                </p>
                            </div>

                            {/* What you can do */}
                            <div className="flex flex-col gap-2">
                                {(t('demo.welcomeFeatures', { returnObjects: true }) as string[]).map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className="text-brand mt-0.5 flex-shrink-0">✓</span>
                                        <span className="text-text-secondary text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Note */}
                            <p className="text-text-muted text-xs bg-bg-page rounded-xl px-4 py-3 border border-border leading-relaxed">
                                {t('demo.welcomeNote')}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleWelcomeDismiss}
                                    className="w-full bg-brand hover:bg-brand/90 active:scale-[0.99] text-bg-card rounded-xl py-3.5 font-bold text-sm transition-all"
                                >
                                    {t('demo.welcomeCta')}
                                </button>
                                <Link
                                    to="/register"
                                    className="w-full text-center py-3 text-brand text-sm font-medium hover:underline"
                                    onClick={handleWelcomeDismiss}
                                >
                                    {t('demo.welcomeRegister')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PageWrapper
