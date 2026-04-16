import {useAuth} from "../hooks/useAuth.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect} from "react";

const AuthCallback = () => {

    const { login } = useAuth()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token && token != "") {
            login(token)
            navigate('/dashboard')
        } else {
            navigate('/login')
        }
    }, [])

    return <></>
}

export default AuthCallback;