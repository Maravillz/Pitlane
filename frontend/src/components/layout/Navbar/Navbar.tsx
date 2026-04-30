import { useAuth } from '../../../hooks/useAuth'
import ProfileDropdown from "./components/ProfileDropdown.tsx";
import AppButton from "../../ui/AppButton.tsx";
import LanguageToggle from "./components/LanguageToggle.tsx";
import {Link, matchPath, useLocation, useNavigate} from "react-router-dom";
import {ArrowLeftIcon} from "@heroicons/react/16/solid";

/**
 * Represents the application navbar
 * @constructor
 */
const Navbar = () => {

    /** Routes that convert the application icon into a return arrow */
    const RETURN_ROUTES = ['/maintenance']

    /** Routes that remove the application icon in the header (in both cases the application icon appears in the center of the screen) */
    const NO_ICON_ROUTES = ['/register', '/login']

    const { pathname } = useLocation()
    const hasReturn = RETURN_ROUTES.some(route => pathname.startsWith(route))
    const hasNoIcon = NO_ICON_ROUTES.some(route => pathname.startsWith(route))

    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation();
    const isLoginPage: boolean = matchPath('/login', location.pathname.toString().toLowerCase()) != null;


    return (
        <nav className="sticky top-0 z-30 w-full bg-bg-page/80 backdrop-blur-md border-b border-border/50 lg:h-[7%]">
            <div className="px-5 md:px-8 max-w-4xl mx-auto lg:mx-2 lg:max-w-full">
                <div className="flex h-14 items-center justify-between">

                    {/* Left — logo or back arrow (mobile only) */}
                    <div className="flex items-center">
                        <div className="md:hidden">
                            {hasReturn ? (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </button>
                            ) : hasNoIcon ? (
                                <Link to="/" />
                            ) : (
                                <Link to="/" className="text-brand font-black text-xl tracking-tight">
                                    Pitlane
                                </Link>
                            )}
                        </div>
                        {/* Desktop: brand is in sidebar, show nothing here */}
                        <div className="hidden md:block" />
                    </div>

                    {/* Right — language + profile */}
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        {isLoginPage ? null : (
                            isAuthenticated
                                ? <ProfileDropdown />
                                : <AppButton text="Login" type="Secondary" onClick={() => navigate('/login')} />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar