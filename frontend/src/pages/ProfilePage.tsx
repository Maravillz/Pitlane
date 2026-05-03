import {useTranslation} from "react-i18next";
import {useAuth} from "../hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {vehicleService} from "../services/vehicleService.ts";
import {costsService} from "../services/costsService.ts";
import {getDefaultAvatar} from "../models/user.ts";
import {ChevronRightIcon} from "@heroicons/react/16/solid";

/**
 * Represents the user profile page
 * @constructor
 */
const ProfilePage = () => {
    const { t } = useTranslation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<{ vehicles: number, totalCosts: number, maintenances: number } | null>(null)
    const isDemo = localStorage.getItem('isDemo') === 'true'

    useEffect(() => {
        Promise.all([
            vehicleService.getAllUserVehicles(),
            costsService.getCosts('total')
        ]).then(([vehicles, costs]) => {
            const totalMaintenances = vehicles.reduce((sum) => sum, 0)
            setStats({
                vehicles: vehicles.length,
                totalCosts: costs.totalCents,
                maintenances: totalMaintenances
            })
        }).finally(() => setLoading(false))
    }, [])

    const menuItems = [
        { icon: '', label: t('profile.alerts'), onClick: () => navigate('/alerts') },
        { icon: '', label: t('profile.myVehicles'), onClick: () => navigate('/dashboard') },
    ]

    const handleLogout = async () => {
        if (isDemo) {
            await fetch(`${import.meta.env.VITE_API_URL}/api/demo/session/end`, {
                method: 'POST'
            })
            localStorage.removeItem('isDemo')
        }
        localStorage.removeItem('token')
        logout()
        navigate('/login')
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Avatar + info */}
            <div className="flex flex-col items-center py-8 gap-3">
                <div className="relative">
                    <img
                        src={getDefaultAvatar(user?.displayName ?? 'U T')}
                        className="w-20 h-20 rounded-full ring-2 ring-brand/20"
                        alt=""
                    />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-alert-none rounded-full border-2 border-bg-page" />
                </div>
                <div className="text-center">
                    <p className="text-text-primary text-lg font-bold">{user?.displayName}</p>
                    <p className="text-text-secondary text-sm">{user?.email}</p>
                </div>
            </div>

            {/* Stats */}
            {!loading && stats && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: stats.vehicles, label: t('profile.vehicles') },
                        { value: `${(stats.totalCosts / 100).toFixed(0)}€`, label: t('profile.totalCosts'), highlight: true },
                        { value: stats.maintenances, label: t('profile.maintenances') },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center bg-bg-card rounded-2xl p-4 border border-border">
                            <span className={`text-xl font-bold ${stat.highlight ? 'text-brand' : 'text-text-primary'}`}>
                                {stat.value}
                            </span>
                            <span className="text-xs text-text-secondary text-center mt-1 leading-tight">{stat.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Menu items */}
            <div className="flex flex-col bg-bg-card rounded-2xl border border-border overflow-hidden">
                {menuItems.map((item, i) => (
                    <button
                        key={i}
                        className={`flex items-center justify-between px-5 py-4 hover:bg-border active:bg-border transition-colors
                            ${i < menuItems.length - 1 ? 'border-b border-border' : ''}`}
                        onClick={item.onClick}
                    >
                        <div className="flex items-center gap-3 text-text-primary">
                            <span className="text-text-secondary">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-text-muted" />
                    </button>
                ))}
            </div>

            {/* Logout */}
            <button
                className="w-full py-3.5 rounded-2xl border border-alert-critical/40 text-alert-critical text-sm font-semibold hover:bg-alert-critical-bg active:scale-[0.99] transition-all duration-150"
                onClick={() => handleLogout()}
            >
                {t('nav.signOut')}
            </button>
        </div>
    )
}

export default ProfilePage