import AppButton from "../components/ui/AppButton.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {vehicleService} from "../services/vehicleService.ts";
import type {UpdateVehicleRequest, VehicleDetailResponse} from "../models/vehicle.ts";
import type {AlertResponse} from "../models/alert.ts";
import type {MaintenanceResponse} from "../models/maintenance.ts";
import {useTranslation} from "react-i18next";
import RegisterMileageModal from "../components/layout/RegisterMileageModal.tsx";
import EditVehicleModal from "../components/layout/EditVehicleModal.tsx";
import {CheckCircleIcon} from "@heroicons/react/16/solid";
import { sortAlertsByProximity } from '../utils/alertUtils'
import AlertCard from "../components/ui/AlertCard.tsx";

/**
 * Represents the detail page for the vehicle
 * @constructor
 */
const CarDetailPage = () => {

    const { id } = useParams()
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState<VehicleDetailResponse>()
    const { t } = useTranslation()
    const [showMileageModal, setShowMileageModal] = useState(false)
    const [showVehicleModal, setShowVehicleModal] = useState(false)

    useEffect(() => {
        if (id && id != "") {
            vehicleService.getVehicle(id).then((vehicle) =>
                vehicle != null ? setVehicle(vehicle) : navigate("/"))

        } else {
            navigate("/")
        }
    }, [id, navigate])

    const statsCard = [
        {
            value: vehicle?.totalMaintenances,
            label: t("carDetail.interv")
        },
        {
            value: `${((vehicle?.totalCosts ?? 0) / 100).toFixed(2)}€`,
            label: t("carDetail.total")
        },
        {
            value: vehicle?.totalAlerts,
            label: (vehicle?.totalAlerts != null && vehicle?.totalAlerts > 1 ? t("carDetail.Alerts") : t("carDetail.Alert"))
        }
    ]

    const setAlertLabel = (vehicle: VehicleDetailResponse | undefined): string => {
        const activeAlertNumber: number = vehicle?.nrActiveAlerts ?? 0;
        if(activeAlertNumber > 1){
            return `${activeAlertNumber} ${t("carDetail.alerts")}`
        } else {
            return `${activeAlertNumber} ${t("carDetail.alert")}`
        }
    }


    return  <div>

                { /* Vehicle info */ }

                <div className="flex flex-row justify-between ">
                    <div className="flex flex-col items-start">
                        <span className="text-[1.2rem] text-[#CCC]">{`${vehicle?.brand} ${vehicle?.model}`}</span>
                        <span className="text-[0.8rem] text-[#888]">{`${vehicle?.year} | ${vehicle?.plate}`}</span>
                        <span className="pl-2 text-[0.95rem] text-[#f5a623]">{`${vehicle?.mileage} km`}</span>
                        <span className="pl-2 text-[0.7rem] text-[#888]">{`${t("carDetail.updated")} ${vehicle?.lastUpdated != null ? new Date(vehicle?.lastUpdated).toLocaleDateString() : ''}`}</span>
                    </div>
                    {vehicle?.nrActiveAlerts != 0 ?
                        <div className="flex bg-[#2a1f0a] backdrop-opacity-90 rounded-2xl h-fit px-4 py-1">
                            <span className="text-[0.6rem] text-[#f5a623]">{setAlertLabel(vehicle)}</span>
                        </div> : <></>}
                </div>

                { /* Vehicle actions */ }

                <div className="flex flex-row gap-2 mt-6">
                    <AppButton className="flex-1 text-sm flex h-9 px-2 py-6 items-center justify-center rounded-xl"
                        onClick={() => setShowMileageModal(true)}
                        text={t("carDetail.registerKm")}
                        type={"Tertiary"}
                    />
                    <AppButton
                        className="flex-1 text-sm flex h-9 px-2 py-6 items-center justify-center rounded-xl"
                        onClick={() => {navigate(`/maintenance`, {
                            state: { vehicleId: id, currentMileage: vehicle?.mileage }
                        })}}
                        text={t("carDetail.newMaint")}
                        type={"Primary"}/>
                    <AppButton className="flex-1 text-sm flex h-9 px-2 py-6 items-center justify-center rounded-xl"
                               onClick={() => setShowVehicleModal(true)}
                               text={t("carDetail.edit")}
                               type={"Tertiary"}/>
                </div>

                { /* Vehicle stats cards */ }

                <p className="text-[#888] my-4 text-sm">{t("carDetail.resume")}</p>
                <div className="w-full flex flex-row gap-3">
                    { statsCard?.map((stat) => {
                        return <div className="flex flex-col justify-center w-full p-4 bg-[#1a1a1a] rounded-xl">
                            <span className="text-[#CCC] text-center">{stat.value}</span>
                            <span className="text-sm text-[#888] text-center">{stat.label}</span>
                        </div>
                    })
                    }
                </div>

                { /* Vehicle alerts */ }

                <p className="text-[#888] my-4 text-sm">{t("carDetail.Alerts")}</p>
                {vehicle?.alerts.length === 0 && (
                    <div className="flex flex-col items-center">
                        <CheckCircleIcon className="text-[#f5a623] w-7 h-7 mb-3"/>
                        <span className="text-[#888] text-sm">{t('carDetail.noAlerts')}</span>
                    </div>
                )}
                <div className="flex flex-col gap-3">
                        { sortAlertsByProximity(vehicle?.alerts ?? [], Number(vehicle?.mileage)).map((alert: AlertResponse) => (
                            <AlertCard
                                key={alert.id}
                                id={alert.id}
                                maintenanceType={alert.maintenanceType}
                                intervalKm={alert.intervalKm}
                                intervalDays={alert.intervalDays}
                            />
                        ))}
                </div>

                { /* Vehicle no maintenances prompt */ }

                <div>
                    <div className="flex flex-row justify-between my-4">
                        <span className="text-[#888] text-sm">{t("carDetail.maintenances")}</span>
                    </div>
                    {vehicle?.maintenances.length === 0 && (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[#888] text-sm">{t('carDetail.noMaintenances')}</span>
                            <button
                                className="text-[#f5a623] text-sm"
                                onClick={() => navigate('/maintenance', { state: { vehicleId: id, currentMileage: vehicle?.mileage } })}
                            >
                                {t('carDetail.addFirst')}
                            </button>
                        </div>
                    )}

                    { /* Vehicle maintenances */ }

                    <div className="flex flex-col gap-3">
                        { vehicle?.maintenances.slice()
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((maintenance: MaintenanceResponse) => {
                                return <div className="flex flex-row justify-between items-center bg-[#1a1a1a] p-2 rounded-r-xl">
                                    <div className="flex flex-row gap-3 items-center">
                                        <div className="flex flex-col pl-2">
                                            <span className="text-sm text-[#CCC]">{t(`maintenanceTypes.${maintenance.type}`)}</span>
                                            <span className="text-sm text-[#888]">{`${maintenance.date} - ${maintenance.mileage} km`}</span>
                                        </div>
                                    </div>
                                    <span className="text-[#868686]">{`${((maintenance.costCents ?? 0) / 100).toFixed(2)}€`}</span>
                                </div>

                            }
                        )}
                    </div>
                </div>

                { /* Car detail modals */ }

                {showMileageModal && vehicle && (
                    <RegisterMileageModal
                        vehicleId={id ?? ''}
                        currentMileage={Number(vehicle.mileage)}
                        onClose={() => setShowMileageModal(false)}
                        onSuccess={(newMileage) => {
                            setVehicle(prev => prev ? { ...prev, mileage: newMileage.toString(), lastUpdated: ((new Date()).toISOString()) } : prev)
                        }}
                    />
                )}
                {showVehicleModal && vehicle && (
                    <EditVehicleModal
                        vehicleId={id ?? ''}
                        brand={vehicle.brand}
                        model={vehicle.model}
                        year={Number(vehicle.year)}
                        plate={vehicle.plate}
                        onClose={() => setShowVehicleModal(false)}
                        onSuccess={(updateVehicle: UpdateVehicleRequest) => {
                            setVehicle(prev => prev ? { ...prev, brand: updateVehicle.brand, model: updateVehicle.model, year: updateVehicle.year, plate: updateVehicle.plate } : prev)
                        }}
                    />
                )}
            </div>
}

export default CarDetailPage;