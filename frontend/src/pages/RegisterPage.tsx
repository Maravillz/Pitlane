import {useState} from "react";
import type {RegisterRequest} from "../models/auth.ts";
import {useAuth} from "../hooks/useAuth.ts";
import {Link, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {authService} from "../services/authService.ts";

const RegisterPage = () => {
    const [form, setForm] = useState<RegisterRequest>({ email: '', password: '', displayName: '' })
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await authService.register(form)
            login(res.token)
            navigate('/dashboard')
        } catch {
            setError(t('register.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex items-center justify-center p-8">
            <div className="lg:w-4/12 w-full max-w-400px rounded-2xl">
                <h1 className="text-[#f5a623] text-3xl font-bold text-center mb-1">{t('register.title')}</h1>
                <p className="text-[#888] text-center mb-8 text-base">{t('register.subtitle')}</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-2">
                        <label className="text-[#ccc] text-base">{t('register.name')}</label>
                        <input
                            className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                            name="displayName"
                            type="displayName"
                            placeholder={t("register.displayNamePlaceholder")}
                            value={form.displayName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#ccc] text-base">{t('register.email')}</label>
                        <input
                            className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                            name="email"
                            type="email"
                            placeholder={t("register.emailPlaceholder")}
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#ccc] text-base">{t('register.password')}</label>
                        <input
                            className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                            name="password"
                            type="password"
                            placeholder={t("register.passwordPlaceholder")}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#ccc] text-base">{t('register.confirmPassword')}</label>
                        <input
                            className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                            name="password"
                            type="password"
                            placeholder={t("register.passwordPlaceholder")}
                            value={passwordConfirmation}
                            onChange={(e) => {setPasswordConfirmation(e.target.value)}}
                            required
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center">
                        <div className="flex items-center">
                            <input id="default-checkbox" type="checkbox" value=""
                                   className="accent-[#f5a623] w-4 h-4 border border-default-medium rounded-xl bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"/>
                            <label htmlFor="default-checkbox"
                                   className="select-none ms-2 text-[0.8rem] text-heading text-[#CCC]">{t('register.terms')}</label>
                        </div>
                    </div>

                    {error && <p className="text-[#e74c3c] text-sm m-0">{error}</p>}

                    <button type="submit"
                            className="bg-[#f5a623] text-[#1a1a1a] rounded-xl p-3.5 mt-2 text-base font-semibold disabled:opacity-60" disabled={loading}>
                        {loading ? t('register.submitting') : t('register.submit')}
                    </button>
                </form>

                <div className="flex items-center text-center text-[#555] text-sm my-5 gap-3 before:flex-1 before:border-t before:border-[#3a3a3a] after:flex-1 after:border-t after:border-[#3a3a3a]"><span>{t('register.or')}</span></div>

                <button className="w-full bg-transparent text-[#ccc] border border-solid border-[#3a3a3a] rounded-xl p-3.5 text-base" onClick={authService.loginWithGoogle}>
                    {t('register.google')}
                </button>

                <p className="text-center text-[#888] text-sm mt-5">
                    {t('register.register')} <Link to="/Login">{t('register.registerLink')}</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage;