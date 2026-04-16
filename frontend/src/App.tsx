import LoginPage from './pages/LoginPage.tsx'
import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import PageWrapper from "./components/layout/PageWrapper.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

const App = () => {
    return (
        <PageWrapper>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route index element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </PageWrapper>
    )
}

export default App
