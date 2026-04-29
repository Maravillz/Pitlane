import {useAuth} from "../hooks/useAuth.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import {authService} from "../services/authService.ts";

/**
 * Component called when the user logs in with Google so it logs in the user with the token
 * @constructor
 */
const AuthCallback = () => {

    const { login } = useAuth()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token && token != "") {

            localStorage.setItem('token', token)

            authService.userInfo()
                .then(user => {
                    login(token, user)
                    navigate('/dashboard')
                })
        } else {
            navigate('/login')
        }
    }, [login, navigate, searchParams])

    return <></>
}

export default AuthCallback;