import {useTranslation} from "react-i18next";
import type {VehicleResponse} from "../models/vehicle.ts";
import { vehicleService } from '../services/vehicleService.ts'
import {useEffect, useState} from "react";
import {ChevronRightIcon, PlusIcon} from "@heroicons/react/16/solid";
import {useNavigate} from "react-router-dom";

/**
 * Represents the main page after the user logs in
 */
const DashboardPage = () => {

    const { t } = useTranslation();
    const [vehicles, setVehicles] = useState<VehicleResponse[]>();
    const navigate = useNavigate();

    const statsCard = [
        {
            value: vehicles?.map(v => v.totalMonthMaintenances).reduce(((prev, maint) => prev + maint)),
            label: t("dashboard.thisMonth")
        },
        {
            value: (Math.round(vehicles?.map(v => v.totalMonthSpent).reduce(((prev, cost) => prev + cost)) ?? 0) / 100).toFixed(0) + "€",
            label: t("dashboard.costs"),
            highlight: true
        },
        {
            value: vehicles?.map(v => v.totalMonthAlerts).reduce(((prev, alert) => prev + alert)),
            label: t("dashboard.alerts")
        }
    ]




    useEffect(() => {
        vehicleService.getAllUserVehicles().then((vehicles ) => {
            const vehiclesResp : VehicleResponse[] = vehicles.map( (v) => {
                switch (v.alertStatus){
                    case "CRITICAL":
                        return { ...v, alertColor: "#be525d" }

                    case "WARNING":
                        return { ...v, alertColor: "#f59e0b" }

                    case "NONE":
                        return { ...v, alertColor: "#10b981" }

                    default:
                        return { ...v, alertColor: "#10b981" }
                }}
            )
            setVehicles(vehiclesResp)

        })
    }, [])

    const translateAlertMessage = (message: string | null): string => {
        if (!message) return t('dashboard.noAlerts')

        const parts = message.split(' dashboard.in ')
        if (parts.length < 2) return message

        const type = parts[0]
        const rest = parts[1]

        return `${t(`maintenanceTypes.${type}`)} ${t("dashboard.in")} ${rest.replace("dashboard.days",t("dashboard.days"))}`
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Stats */}
            <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                    {t('dashboard.quickResume')}
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {statsCard.map((stat, i) => (
                        <div
                            key={i}
                            className="flex flex-col justify-center bg-bg-card rounded-2xl p-4 border border-border hover:border-border-subtle transition-colors"
                        >
                            <span className={`text-xl font-bold text-center ${stat.highlight ? 'text-brand' : 'text-text-primary'}`}>
                                {stat.value}
                            </span>
                            <span className="text-xs text-text-secondary text-center mt-1 leading-tight">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vehicles */}
            <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                    {t('dashboard.myGarage')}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {vehicles?.map(vehicle => (
                        <button
                            key={vehicle.id}
                            onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                            className="flex flex-row items-center w-full bg-bg-card rounded-2xl p-4 border border-border hover:border-border-subtle active:scale-[0.99] transition-all duration-150 text-left"
                        >
                            {/* Alert dot */}
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-4"
                                style={{ backgroundColor: vehicle.alertColor }}
                            />

                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-text-primary font-semibold text-sm truncate">
                                    {vehicle.brand} {vehicle.model}
                                </span>
                                <span className="text-text-secondary text-xs mt-0.5">
                                    {vehicle.currentMileage.toLocaleString()} km
                                </span>
                                <span
                                    className="text-xs mt-1 font-medium"
                                    style={{ color: vehicle.alertColor }}
                                >
                                    {translateAlertMessage(vehicle.alertMessage ?? '')}
                                </span>
                            </div>

                            <ChevronRightIcon className="w-4 h-4 text-text-muted flex-shrink-0 ml-2" />
                        </button>
                    ))}

                    <button
                        onClick={() => navigate('/vehicle')}
                        className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand/90 active:scale-[0.99] text-bg-card font-semibold rounded-2xl p-4 transition-all duration-150"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="text-sm">Adicionar Carro</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage