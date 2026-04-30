import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth.ts'
import { authService } from '../services/authService.ts'
import type { LoginRequest } from '../models/auth.ts'

const DEMO_EMAIL = 'demo@pitlane.com'
const DEMO_PASSWORD = 'pitlane-demo-2024'

/**
 * Represents the login page
 * @constructor
 */
const LoginPage = () => {
    const [form, setForm] = useState<LoginRequest>({ email: '', password: '' })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [demoLoading, setDemoLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    /** After logging in, the app makes a request to store the user info to present it */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await authService.login(form)
            localStorage.setItem('token', res.token)
            const user = await authService.userInfo()
            login(res.token, user)
            navigate('/dashboard')
        } catch {
            setError(t('login.error'))
        } finally {
            setLoading(false)
        }
    }

    const doLogin = async (email: string, password: string, isDemo = false) => {
        const res = await authService.login({ email, password })
        localStorage.setItem('token', res.token)
        if (isDemo) localStorage.setItem('isDemo', 'true')
        else localStorage.removeItem('isDemo')
        const user = await authService.userInfo()
        login(res.token, user)
        navigate('/dashboard')
    }

    const handleDemoLogin = async () => {
        setDemoLoading(true)
        setError(null)
        try {
            await doLogin(DEMO_EMAIL, DEMO_PASSWORD, true)
        } catch {
            setError('Não foi possível carregar a demonstração. Tenta novamente.')
        } finally {
            setDemoLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 lg:py-12 mt-[-60px] lg:mt-[-150px]">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-brand font-black text-4xl tracking-tight mb-2">Pitlane</h1>
                    <p className="text-text-secondary text-sm">{t('login.subtitle')}</p>
                </div>

                {/* Demo button */}
                <button
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                    className="w-full flex items-center justify-center gap-2 bg-brand/10 hover:bg-brand/15 active:scale-[0.99] border border-brand/30 text-brand rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 transition-all duration-150 mb-6"
                >
                    {demoLoading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                            A carregar demonstração...
                        </>
                    ) : (
                        <>
                            <span>▶</span>
                            Ver demonstração
                        </>
                    )}
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-text-muted text-xs">ou entra com a tua conta</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-primary text-sm font-medium">{t('login.email')}</label>
                        <input
                            className="bg-bg-card border border-border rounded-xl text-text-primary px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                            name="email"
                            type="email"
                            placeholder={t('login.emailPlaceholder')}
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-primary text-sm font-medium">{t('login.password')}</label>
                        <input
                            className="bg-bg-card border border-border rounded-xl text-text-primary px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                            name="password"
                            type="password"
                            placeholder={t('login.passwordPlaceholder')}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-alert-critical text-sm bg-alert-critical-bg px-4 py-2.5 rounded-xl border border-alert-critical/20">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="bg-brand hover:bg-brand/90 active:scale-[0.99] text-bg-card rounded-xl py-3.5 text-sm font-bold disabled:opacity-50 transition-all duration-150 mt-1"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                                {t('login.submitting')}
                            </span>
                        ) : t('login.submit')}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-text-muted text-xs">{t('login.or')}</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                <button
                    className="w-full flex items-center justify-center gap-3 bg-bg-card hover:bg-border active:scale-[0.99] text-text-primary border border-border rounded-xl py-3.5 text-sm font-medium transition-all duration-150"
                    onClick={authService.loginWithGoogle}
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('login.google')}
                </button>

                <p className="text-center text-text-secondary text-sm mt-6">
                    {t('login.register')}{' '}
                    <Link to="/register" className="text-brand font-medium hover:underline">
                        {t('login.registerLink')}
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage