import { NavLink } from 'react-router-dom'
//import { useAuth } from '../../../hooks/useAuth'
import type {ReactElement} from "react";
import {BellIcon, CurrencyEuroIcon, HomeIcon} from "@heroicons/react/16/solid";
import { HomeIcon as HomeIconSolid, BellIcon as BellIconSolid, CurrencyEuroIcon as CurrencyEuroIconSolid } from '@heroicons/react/24/solid'
import {useTranslation} from "react-i18next";

interface BottomMenu {
    icon: ReactElement,
    name: string
    route: string
    iconActive: ReactElement
}

/**
 * Represents the application bottom nav bar
 * @constructor
 */
const BottomNav = () => {

    const { t } = useTranslation()

    const bottomNavMenus: BottomMenu[] = [
        {
            icon: <HomeIcon className="w-6 h-6" />,
            iconActive: <HomeIconSolid className="w-6 h-6" />,
            name: t('bottomNav.garage'),
            route: '/dashboard'
        },
        {
            icon: <BellIcon className="w-6 h-6" />,
            iconActive: <BellIconSolid className="w-6 h-6" />,
            name: t('bottomNav.alerts'),
            route: '/alerts'
        },
        {
            icon: <CurrencyEuroIcon className="w-6 h-6" />,
            iconActive: <CurrencyEuroIconSolid className="w-6 h-6" />,
            name: t('bottomNav.costs'),
            route: '/costs'
        }
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-border flex justify-around h-16 safe-bottom">
            {bottomNavMenus.map((menu) => (
                <NavLink
                    key={menu.route}
                    to={menu.route}
                    className={({ isActive }) =>
                        `flex flex-col justify-center items-center gap-1 flex-1 transition-all duration-200
                        ${isActive ? 'text-brand' : 'text-text-muted'}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive ? menu.iconActive : menu.icon}
                            <span className="text-[10px] font-medium">{menu.name}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    )
}

export default BottomNav