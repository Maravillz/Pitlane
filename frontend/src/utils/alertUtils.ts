import type { AlertListResponseDto, AlertResponse } from '../models/alert'

/** The values 0-2 are given to severity status in order to sort the alerts by severity */
const ALERT_PRIORITY: Record<string, number> = {
    'CRITICAL': 0,
    'WARNING': 1,
    'NONE': 2
}

/**
 * Sorts by severity and if it is the same sorts by closest to the deadline
 * Used in the AlertPage.
 * @param alerts The list of alerts to sort
 */
export const sortAlertsByStatus = (alerts: AlertListResponseDto[]): AlertListResponseDto[] => {
    return alerts.slice().sort((a, b) => {
        const priorityA = ALERT_PRIORITY[a.alertStatus] ?? 2
        const priorityB = ALERT_PRIORITY[b.alertStatus] ?? 2

        if (priorityA !== priorityB) return priorityA - priorityB

        const scoreA = Math.min(a.intervalKm ?? Infinity, a.intervalDays ?? Infinity)
        const scoreB = Math.min(b.intervalKm ?? Infinity, b.intervalDays ?? Infinity)

        return scoreA - scoreB
    })
}

/**
 * Sorts alerts by the closes km or date to the deadline mostly for when there is only one metric for the alert, else date is prioritized
 * Used in the CarDetailPage.
 * @param alerts The list of alerts to sort
 * @param currentMileage The current vehicle mileage
 */
export const sortAlertsByProximity = (alerts: AlertResponse[], currentMileage: number): AlertResponse[] => {
    return alerts.slice().sort((a, b) => {
        const kmRemainingA = a.intervalKm != null ? a.intervalKm - currentMileage : Infinity
        const daysRemainingA = a.intervalDays ?? Infinity

        const kmRemainingB = b.intervalKm != null ? b.intervalKm - currentMileage : Infinity
        const daysRemainingB = b.intervalDays ?? Infinity

        const scoreA = Math.min(kmRemainingA, daysRemainingA)
        const scoreB = Math.min(kmRemainingB, daysRemainingB)

        return scoreA - scoreB
    })
}