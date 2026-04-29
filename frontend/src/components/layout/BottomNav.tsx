import { NavLink } from 'react-router-dom'
//import { useAuth } from '../../../hooks/useAuth'
import type {ReactElement} from "react";
import {BellIcon, CurrencyEuroIcon, HomeIcon} from "@heroicons/react/16/solid";
import {useTranslation} from "react-i18next";

interface BottomMenu {
    icon: ReactElement,
    name: string
    route: string
}

/**
 * Represents the application bottom nav bar
 * @constructor
 */
const BottomNav = () => {

    const { t } = useTranslation()

    const bottomNavMenus: BottomMenu[] = [
        {
            icon: <HomeIcon className="w-6 h-6"/>,
            name: t("bottomNav.garage"),
            route: "/dashboard"
        },
        {
            icon: <BellIcon className="w-6 h-6"/>,
            name: t("bottomNav.alerts"),
            route: "/alerts"
        },
        {
            icon: <CurrencyEuroIcon className="w-6 h-6"/>,
            name: t("bottomNav.costs"),
            route: "/costs"
        }
    ]

    return (
        <nav className="border-t border-[#2e2e2e] flex justify-around bottom-0 absolute w-screen h-[9%] z-50">
            {bottomNavMenus.map((menu: BottomMenu) => {
                return <NavLink to={menu.route}
                                className={({ isActive }) => "flex flex-col justify-center items-center gap-1 text-[#888] flex-1 py-1.5" + (isActive ? "text-[#f5a623]" : "")}>
                    {menu.icon}
                        <span className="text-sm">{menu.name}</span>
                    </NavLink>
                })
            }
        </nav>
    )
}

export default BottomNav