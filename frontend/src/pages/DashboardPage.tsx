import {useTranslation} from "react-i18next";
import type {VehicleResponse} from "../models/vehicle.ts";
import { vehicleService } from '../services/vehicleService.ts'
import {useEffect, useState} from "react";
import AppButton from "../components/ui/AppButton.tsx";
import {PlusIcon} from "@heroicons/react/16/solid";
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
            value: (Math.round(vehicles?.map(v => v.totalMonthSpent).reduce(((prev, cost) => prev + cost)) ?? 0) / 100).toFixed(2) + "€",
            label: t("dashboard.costs")
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

    return <div>
                <p className="md:text-2xl text-[#888] mb-4 mt-1 text-base">{t('dashboard.quickResume')}</p>
                <div className="md:gap-6 md:mb-10 w-full flex flex-row gap-3 mb-4">
                    { statsCard?.map((stat) => {
                        return <div className="md:p-6 flex flex-col justify-center w-full p-3 bg-[#1a1a1a] rounded-xl">
                            <span className="md:text-xl text-[#CCC] text-center">{stat.value}</span>
                            <span className="md:text-xl text-sm text-[#888] text-center">{stat.label}</span>
                        </div>
                    })
                    }
                </div>
                <p className="md:text-2xl text-[#888] mb-4 text-base">{t('dashboard.myGarage')}</p>
                <div className="w-full flex flex-col gap-3">
                    <div className="flex flex-col gap-3">
                    { vehicles?.map((vehicle) => {
                        return <div className="flex flex-row w-full p-4 bg-[#1a1a1a] rounded-xl" onClick={() => navigate(`/vehicle/${vehicle.id}`)}>
                            <div className="flex flex-col flex-1 gap-1">
                                <span className="text-[#CCC]">{`${vehicle.brand} ${vehicle.model}`}</span>
                                <span className="text-sm text-[#888]">{`${vehicle.currentMileage} km`}</span>
                                <span className="text-sm" style={{ color: vehicle.alertColor }}>
                                    {translateAlertMessage(vehicle.alertMessage ?? "")}
                                </span>
                            </div>
                            <div className={`rounded-full w-4 h-4`} style = { {
                                backgroundColor: vehicle.alertColor
                            }}></div>
                        </div>
                      })
                    }
                    </div>
                    <AppButton className="flex h-12.5 items-center justify-center rounded-xl font-semibold" onClick={()=>{navigate("/vehicle")}} startIcon={<PlusIcon className="w-4 h-4"/>} text={"Adicionar Carro"} type={"Primary"}/>
                </div>

            </div>
}

export default DashboardPage