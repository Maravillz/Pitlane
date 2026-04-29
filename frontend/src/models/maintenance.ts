import type {AlertResponse} from "./alert.ts";

/** */
export type MaintenanceType =
    | 'OIL_CHANGE'
    | 'TIRE_ROTATION'
    | 'BRAKE_SERVICE'
    | 'AIR_FILTER'
    | 'SPARK_PLUGS'
    | 'TIMING_BELT'
    | 'COOLANT_FLUSH'
    | 'TRANSMISSION_SERVICE'
    | 'BATTERY'
    | 'INSPECTION'
    | 'OTHER'

/** An array with all the same types as the enum to include in the dropdown picker */
export const MAINTENANCE_TYPES: MaintenanceType[] = [
    'OIL_CHANGE',
    'TIRE_ROTATION',
    'BRAKE_SERVICE',
    'AIR_FILTER',
    'SPARK_PLUGS',
    'TIMING_BELT',
    'COOLANT_FLUSH',
    'TRANSMISSION_SERVICE',
    'BATTERY',
    'INSPECTION',
    'OTHER'
]

/** The maintenance information to present in the vehicle page */
export interface MaintenanceResponse {
    id: string
    type: MaintenanceType
    date: string
    mileage: number
    costCents: number | null
    notes: string | null
    createdAt: string
    alert: AlertResponse | null
}

/** The information provided to create a maintenance and an alert if requested */
export interface CreateMaintenanceRequest {
    maintenanceType: MaintenanceType
    date: string
    mileage: number | undefined
    costCents?: number
    notes?: string
    alertIntervalKm?: number
    alertIntervalDays?: number
    createAlert: boolean
}