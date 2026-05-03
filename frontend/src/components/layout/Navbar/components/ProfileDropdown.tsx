import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {useNavigate} from "react-router-dom";
import type {MouseEventHandler} from "react";
import {useTranslation} from "react-i18next";
import {getDefaultAvatar} from "../../../../models/user.ts";
import {useAuth} from "../../../../hooks/useAuth.ts";

interface DropdownMenuItem {
    name: string,
    onClick: MouseEventHandler<HTMLAnchorElement>
}

/**
 * Represents the user icon that allows the user to click and a menu appears with actions
 * @constructor
 */
const ProfileDropdown = () => {

    const navigate = useNavigate()
    const { user, logout } = useAuth();

    const { t } = useTranslation()

    const menuItems: DropdownMenuItem [] = [
        {name: t("nav.profile"), onClick: () => { navigate("/profile") }},
        {name: t("nav.signOut"), onClick: () => handleLogout}
    ]

    const handleLogout = async () => {
        const isDemo = localStorage.getItem('isDemo') === 'true'
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
        <Menu as="div" className="relative ml-3">
            <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 ">
                <span className="absolute -inset-1.5" />
                {/* Defaults to UT (User Testing) if the user display name is not read properly */}
                <img
                    alt=""
                    src={getDefaultAvatar(user?.displayName ?? 'U T')}
                    className="lg:size-10 lg:mt-5 size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
            >
                {menuItems.map((menuItem: DropdownMenuItem) =>{
                    return (
                        <MenuItem>
                            <a
                                onClick={menuItem.onClick}
                                className="block px-4 py-2 text-sm bg-[#242424] text-[#CCC]"
                            >
                                {menuItem.name}
                            </a>
                        </MenuItem>
                    )
                })}

            </MenuItems>
        </Menu>
    )
}

export default ProfileDropdown;