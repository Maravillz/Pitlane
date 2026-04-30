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

    const activeAlerts = sortAlertsByStatus(alertList.filter(a => a.resolvedAt == null))
    const resolvedAlerts = sortAlertsByStatus(alertList.filter(a => a.resolvedAt != null))

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Active alerts */}
                <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">{t('alertPage.actives')}</p>
                    {activeAlerts.length === 0 ? (
                        <div className="flex flex-col items-center py-8 gap-2 bg-bg-card rounded-2xl border border-border">
                            <CheckCircleIcon className="w-8 h-8 text-alert-none" />
                            <span className="text-text-secondary text-sm">{t('alerts.allGood')}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {activeAlerts.map(alert => (
                                <AlertCard
                                    key={alert.id}
                                    id={alert.id}
                                    maintenanceType={alert.maintenanceType}
                                    intervalKm={alert.intervalKm}
                                    intervalDays={alert.intervalDays}
                                    borderColor={alert.alertColor ?? 'var(--color-alert-none)'}
                                >
                                    <button
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-alert-none border border-alert-none/30 hover:bg-alert-none/10 active:scale-95 transition-all flex-shrink-0"
                                        onClick={() => handleResolveAlert(alert.id)}
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                </AlertCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resolved alerts */}
                {resolvedAlerts.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                            {t('alertPage.resolved')}
                        </p>
                        <div className="flex flex-col gap-2 opacity-50">
                            {resolvedAlerts.map(alert => (
                                <AlertCard
                                    key={alert.id}
                                    id={alert.id}
                                    maintenanceType={alert.maintenanceType}
                                    intervalKm={alert.intervalKm}
                                    intervalDays={alert.intervalDays}
                                    borderColor={alert.alertColor ?? 'var(--color-alert-none)'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AlertPage;