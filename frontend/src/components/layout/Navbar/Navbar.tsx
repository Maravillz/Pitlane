import { useAuth } from '../../../hooks/useAuth'
import ProfileDropdown from "./components/ProfileDropdown.tsx";
import AppButton from "../../ui/AppButton.tsx";
import LanguageToggle from "./components/LanguageToggle.tsx";
import {Link, matchPath, useLocation, useNavigate} from "react-router-dom";


const Navbar = () => {

    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation();
    const isLoginPage: boolean = matchPath('/login', location.pathname.toString().toLowerCase()) != null;


    return (
        <nav
            className="relative">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="flex flex-1 items-center justify-start sm:items-stretch sm:justify-start">
                        <Link to="/" className="text-[#f5a623] font-bold text-2xl">Pitlane</Link>
                    </div>

                    <div className="absolute flex flex-row justify-around w-fit inset-y-0 right-0 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <LanguageToggle/>
                        {isLoginPage ? null :
                            (isAuthenticated ? <ProfileDropdown/> : <AppButton text={"Login"} type={"Secondary"} onClick={() => navigate("/login")}/>)}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar