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
        <nav
            className="md:relative top-0 absolute w-screen h-[9%] z-50" >
            <div className="mx-auto px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="md:hidden  flex flex-1 items-center justify-start sm:items-stretch sm:justify-start">

                        {/* Decides between having a return icon, nothing or the app icon */}
                        {hasReturn ? (<ArrowLeftIcon className="w-6 fill-[#CCC]" onClick={() => {navigate(-1)}}/>) :
                            hasNoIcon ?
                                <Link to="/"></Link> :
                                <Link to="/" className="text-[#f5a623] font-bold text-2xl">Pitlane</Link>}
                    </div>

                    <div className="absolute flex flex-row justify-around w-fit inset-y-0 right-0 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <LanguageToggle/>

                        {/* Prompts the login icon if the user is not logged in except if it is the login page */}
                        {isLoginPage ? null :
                            (isAuthenticated ? <ProfileDropdown/> : <AppButton text={"Login"} type={"Secondary"} onClick={() => navigate("/login")}/>)}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar