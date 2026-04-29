import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth.ts'
import { authService } from '../services/authService.ts'
import type { LoginRequest } from '../models/auth.ts'

/**
 * Represents the login page
 * @constructor
 */
const LoginPage = () => {
    const [form, setForm] = useState<LoginRequest>({ email: '', password: '' })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
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

    return (
        <div className="h-full flex items-center justify-center p-8">
            <div className="lg:w-4/12 w-full max-w-400px rounded-2xl">
                <h1 className="text-[#f5a623] text-3xl font-bold text-center mb-1">{t('login.title')}</h1>
                <p className="text-[#888] text-center mb-8 text-base">{t('login.subtitle')}</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[#ccc] text-base">{t('login.email')}</label>
                        <input
                            className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                            name="email"
                            type="email"
                            placeholder={t("login.emailPlaceholder")}
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#ccc] text-base">{t('login.password')}</label>
                        <input
                            className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                            name="password"
                            type="password"
                            placeholder={t("login.passwordPlaceholder")}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <p className="text-[#e74c3c] text-sm m-0">{error}</p>}

                    <button type="submit"
                            className="bg-[#f5a623] text-[#1a1a1a] rounded-xl p-3.5 mt-2 text-base font-semibold disabled:opacity-60" disabled={loading}>
                        {loading ? t('login.submitting') : t('login.submit')}
                    </button>
                </form>

                <div className="flex items-center text-center text-[#555] text-sm my-5 gap-3 before:flex-1 before:border-t before:border-[#3a3a3a] after:flex-1 after:border-t after:border-[#3a3a3a]"><span>{t('login.or')}</span></div>

                <button className="w-full bg-transparent text-[#ccc] border border-solid border-[#3a3a3a] rounded-xl p-3.5 text-base" onClick={authService.loginWithGoogle}>
                    {t('login.google')}
                </button>

                <p className="text-center text-[#888] text-sm mt-5">
                    {t('login.register')} <Link to="/register">{t('login.registerLink')}</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage