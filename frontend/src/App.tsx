import LoginPage from './pages/LoginPage.tsx'
import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import PageWrapper from "./components/layout/PageWrapper.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import CreateVehiclePage from "./pages/CreateVehiclePage.tsx";
import CarDetailPage from "./pages/CarDetailPage.tsx";
import CreateMaintenance from "./pages/CreateMaintenance.tsx";
import AlertPage from "./pages/AlertPage.tsx";
import CostPage from "./pages/CostPage.tsx";
import MaintenanceDetailPage from './pages/MaintenanceDetailPage.tsx'
import {useAuth} from "./hooks/useAuth.ts";

const App = () => {
    const { user } = useAuth();

    return (
        <PageWrapper key={user?.email ?? 'guest'}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/vehicle/:id" element={<CarDetailPage />} />
                <Route path="/vehicle" element={<CreateVehiclePage />} />
                <Route path="/maintenance" element={<CreateMaintenance  />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/alerts" element={<AlertPage />} />
                <Route path="/costs" element={<CostPage />} />
                <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </PageWrapper>
    )
}

export default App
