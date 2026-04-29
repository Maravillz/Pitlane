import {useTranslation} from "react-i18next";
import {useAuth} from "../hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {vehicleService} from "../services/vehicleService.ts";
import {costsService} from "../services/costsService.ts";
import {getDefaultAvatar} from "../models/user.ts";

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

    return (
        <div className="flex flex-col">

            <div className="flex flex-col items-center py-8 gap-2">
                <img
                    src={getDefaultAvatar(user?.displayName ?? 'U T')}
                    className="w-24 h-24 rounded-full"
                    alt=""
                />
                <span className="text-[#ccc] text-xl font-semibold mt-2">{user?.displayName}</span>
                <span className="text-[#888] text-sm">{user?.email}</span>
            </div>

            { /* The stats cards for the account */ }

            {!loading && stats && (
                <div className="flex flex-row gap-3 mb-6">
                    <div className="flex flex-col items-center justify-center flex-1 bg-[#1a1a1a] rounded-xl p-4">
                        <span className="text-[#ccc] text-xl font-bold">{stats.vehicles}</span>
                        <span className="text-[#888] text-xs mt-1">{t('profile.vehicles')}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 bg-[#1a1a1a] rounded-xl p-4">
                        <span className="text-[#ccc] text-xl font-bold">{(stats.totalCosts / 100).toFixed(0)}€</span>
                        <span className="text-[#888] text-xs mt-1">{t('profile.totalCosts')}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 bg-[#1a1a1a] rounded-xl p-4">
                        <span className="text-[#ccc] text-xl font-bold">{stats.maintenances}</span>
                        <span className="text-[#888] text-xs mt-1">{t('profile.maintenances')}</span>
                    </div>
                </div>
            )}

            { /* The page navigate buttons */ }

            <div className="flex flex-col gap-3 rounded-xl ">
                {menuItems.map((item, i) => (
                    <button
                        key={i}
                        className="bg-[#1a1a1a] rounded-xl flex flex-row items-center justify-between px-4 py-4 border-b border-[#2e2e2e] last:border-0"
                        onClick={item.onClick}
                    >
                        <div className="flex flex-row items-center gap-3">
                            <span>{item.icon}</span>
                            <span className="text-[#ccc] text-sm">{item.label}</span>
                        </div>
                        <span className="text-[#555]">›</span>
                    </button>
                ))}
            </div>

            <button
                className="mx-4 mt-6 py-3 rounded-xl border border-[#be525d] text-[#be525d] text-sm font-medium"
                onClick={() => {
                    logout()
                    navigate('/login')
                }}
            >
                {t('nav.signOut')}
            </button>
        </div>
    )
}

export default ProfilePage