import {useTranslation} from "react-i18next";
import type {UserResponse} from "../models/auth.ts";
import {authService} from "../services/authService.ts";
import {useEffect, useState} from "react";

const ProfilePage = () => {

    const { t } = useTranslation()
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        authService.userInfo()
            .then(data => setUser(data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="h-full flex items-center justify-center">
        <p className="text-[#888]">A carregar...</p>
    </div>

    if (!user) return null

    return (
        <div className="h-full flex items-center justify-center p-8 flex-col">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="profile picture" className="w-40 h-40 rounded-full mb-7" />
            <div className="flex flex-col gap-2 w-full mb-7">
                <label className="text-[#ccc] text-base">{t('register.name')}</label>
                <span
                    className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                >
                    {user.displayName}
                </span>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <label className="text-[#ccc] text-base">{t('register.email')}</label>
                <span
                    className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                >
                    {user.email}
                </span>
            </div>
        </div>
    )
}

export default ProfilePage;