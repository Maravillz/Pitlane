import {useEffect, useState} from "react";
import type {AlertListResponseDto} from "../models/alert.ts";
import {alertService} from "../services/alertService.ts";
import {useTranslation} from "react-i18next";
import {CheckCircleIcon, CheckIcon} from "@heroicons/react/16/solid";
import { sortAlertsByStatus } from '../utils/alertUtils'
import AlertCard from "../components/ui/AlertCard.tsx";

/**
 * Represents the page that lists the alerts
 * @constructor
 */
const AlertPage = () => {

    const [alertList, setAlertList] = useState<AlertListResponseDto[]>([])
    const { t } = useTranslation()

    /** Attributes colors based on the severity */
    useEffect(() => {
        alertService.getAlertsByUSer().then((alerts: AlertListResponseDto[]) => {
            const alertsResp : AlertListResponseDto[] = alerts.map( (alerts) => {
                switch (alerts.alertStatus){
                    case "CRITICAL":
                        return { ...alerts, alertColor: "#be525d" }

                    case "WARNING":
                        return { ...alerts, alertColor: "#f59e0b" }

                    case "NONE":
                        return { ...alerts, alertColor: "#10b981" }

                    default:
                        return { ...alerts, alertColor: "#10b981" }
                }}
            )
                setAlertList(alertsResp ?? [])
        })
    }, [])

    /**
     * Resolved an alert and updates the values in real time
     * @param alertId The alert id
     */
    const handleResolveAlert = async (alertId: string) => {
        try {
            await alertService.resolveAlert(alertId)
            setAlertList(prev => prev.map(a =>
                a.id === alertId
                    ? { ...a, resolvedAt: new Date().toISOString() }
                    : a
            ))
        } catch {
            console.error('Error resolving alert')
        }
    }

    return (
        <div className="flex flex-col">
            {alertList.length === 0 ? (
                <div className="flex flex-col items-center ">
                    <CheckCircleIcon className="text-[#f59e0b] w-7 h-7 mb-2"/>
                    <span className="text-[#888] text-sm">{t('alerts.noAlerts')}</span>
                    <span className="text-[#555] text-xs">{t('alerts.noAlertsSubtitle')}</span>
                </div>
            ) : (
                <>
                    <p className="text-[#888] my-4 text-sm">{t('alertPage.actives')}</p>
                    <div className="flex flex-col gap-3">
                        {sortAlertsByStatus(alertList.filter(a => a.resolvedAt == null)).length === 0 ? (
                            <div className="flex flex-col items-center ">
                                <span className="text-2xl text-white">✓</span>
                                <span className="text-[#888] text-sm">{t('alerts.allGood')}</span>
                            </div>
                        ) : (
                            sortAlertsByStatus(alertList.filter(a => a.resolvedAt == null)).map((alert: AlertListResponseDto) => (
                                <AlertCard
                                    key={alert.id}
                                    id={alert.id}
                                    maintenanceType={alert.maintenanceType}
                                    intervalKm={alert.intervalKm}
                                    intervalDays={alert.intervalDays}
                                    borderColor={alert.alertColor ?? '#10b981'}
                                >
                                    <button
                                        className="mr-1 rounded-full w-7 h-7 flex items-center justify-center text-[#10b981] text-xl"
                                        onClick={() => handleResolveAlert(alert.id)}
                                    >
                                        <CheckIcon/>
                                    </button>
                                </AlertCard>
                            ))
                        )}
                    </div>

                    <p className="text-[#888] my-4 text-sm">{t('alertPage.resolved')}</p>
                    <div className="flex flex-col gap-3 opacity-60">
                        {sortAlertsByStatus(alertList.filter(a => a.resolvedAt != null)).map((alert: AlertListResponseDto) => (
                            <AlertCard
                                key={alert.id}
                                id={alert.id}
                                maintenanceType={alert.maintenanceType}
                                intervalKm={alert.intervalKm}
                                intervalDays={alert.intervalDays}
                                borderColor={alert.alertColor ?? '#10b981'}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default AlertPage;