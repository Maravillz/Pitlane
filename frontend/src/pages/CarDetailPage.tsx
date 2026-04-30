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
import {CheckCircleIcon, WrenchScrewdriverIcon} from "@heroicons/react/16/solid";
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
            label: t("carDetail.total"),
            highlight: true
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


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-text-primary text-xl font-bold">
                            {vehicle?.brand} {vehicle?.model}
                        </h1>
                        <p className="text-text-secondary text-sm mt-0.5">
                            {vehicle?.year} · {vehicle?.plate}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-brand font-bold text-lg">
                                {Number(vehicle?.mileage).toLocaleString()} km
                            </span>
                            <span className="text-text-muted text-xs">
                                · {t('carDetail.updated')} {vehicle?.lastUpdated != null ? new Date(vehicle.lastUpdated).toLocaleDateString() : ''}
                            </span>
                        </div>
                    </div>
                    {(vehicle?.nrActiveAlerts ?? 0) > 0 && (
                        <span className="bg-alert-warning-bg text-alert-warning text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
                            {setAlertLabel(vehicle)}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                    <AppButton
                        className="flex-1 text-xs flex h-10 px-2 items-center justify-center rounded-xl font-medium"
                        onClick={() => setShowMileageModal(true)}
                        text={t('carDetail.registerKm')}
                        type="Tertiary"
                    />
                    <AppButton
                        className="flex-1 text-xs flex h-10 px-2 items-center justify-center rounded-xl font-semibold"
                        onClick={() => navigate('/maintenance', { state: { vehicleId: id, currentMileage: vehicle?.mileage } })}
                        text={t('carDetail.newMaint')}
                        type="Primary"
                    />
                    <AppButton
                        className="flex-1 text-xs flex h-10 px-2 items-center justify-center rounded-xl font-medium"
                        onClick={() => setShowVehicleModal(true)}
                        text={t('carDetail.edit')}
                        type="Tertiary"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {statsCard.map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center bg-bg-card rounded-2xl p-4 border border-border">
                            <span className={`text-lg font-bold ${stat.highlight ? 'text-brand' : 'text-text-primary'}`}>
                                {stat.value}
                            </span>
                            <span className="text-xs text-text-secondary text-center mt-1 leading-tight">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Alerts */}
                <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                        {t('carDetail.Alerts')}
                    </p>
                    {vehicle?.alerts.length === 0 ? (
                        <div className="flex flex-col items-center py-6 gap-2 bg-bg-card rounded-2xl border border-border">
                            <CheckCircleIcon className="w-8 h-8 text-alert-none" />
                            <span className="text-text-secondary text-sm">{t('carDetail.noAlerts')}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {sortAlertsByProximity(vehicle?.alerts ?? [], Number(vehicle?.mileage)).map((alert: AlertResponse) => (
                                <AlertCard
                                    key={alert.id}
                                    id={alert.id}
                                    maintenanceType={alert.maintenanceType}
                                    intervalKm={alert.intervalKm}
                                    intervalDays={alert.intervalDays}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-6">
                {/* Maintenances */}
                <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                        {t('carDetail.maintenances')}
                    </p>
                    {vehicle?.maintenances.length === 0 ? (
                        <div className="flex flex-col items-center py-6 gap-3 bg-bg-card rounded-2xl border border-border">
                            <WrenchScrewdriverIcon className="w-8 h-8 text-text-muted" />
                            <span className="text-text-secondary text-sm">{t('carDetail.noMaintenances')}</span>
                            <button
                                className="text-brand text-sm font-medium"
                                onClick={() => navigate('/maintenance', { state: { vehicleId: id, currentMileage: vehicle?.mileage } })}
                            >
                                {t('carDetail.addFirst')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {vehicle?.maintenances.slice()
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((maintenance: MaintenanceResponse) => (
                                    <div key={maintenance.id} className="flex flex-row justify-between items-center bg-bg-card rounded-2xl px-4 py-3 border border-border">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-text-primary font-medium">
                                                {t(`maintenanceTypes.${maintenance.type}`)}
                                            </span>
                                            <span className="text-xs text-text-secondary mt-0.5">
                                                {maintenance.date} · {maintenance.mileage.toLocaleString()} km
                                            </span>
                                        </div>
                                        <span className="text-text-secondary text-sm font-medium">
                                            {((maintenance.costCents ?? 0) / 100).toFixed(2)}€
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
            {showMileageModal && vehicle && (
                <RegisterMileageModal
                    vehicleId={id ?? ''}
                    currentMileage={Number(vehicle.mileage)}
                    onClose={() => setShowMileageModal(false)}
                    onSuccess={newMileage => {
                        setVehicle(prev => prev ? { ...prev, mileage: newMileage.toString(), lastUpdated: new Date().toISOString() } : prev)
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
                    onSuccess={(u: UpdateVehicleRequest) => {
                        setVehicle(prev => prev ? { ...prev, brand: u.brand, model: u.model, year: u.year, plate: u.plate } : prev)
                    }}
                />
            )}
        </div>
    )
}

export default CarDetailPage;