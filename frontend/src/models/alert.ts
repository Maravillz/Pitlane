import type {MaintenanceType} from "./maintenance.ts";

/** Dto used to get information about a specific alert */
export interface AlertResponse {
    /** The alert id */
    id: string

    /** The type of the maintenance the alert is associated to */
    maintenanceType: MaintenanceType

    /** The alert km warning value */
    intervalKm: number | null

    /** The alert days warning value */
    intervalDays: number | null

    /** The date when the alert was resolved */
    resolvedAt: string | null

    /** The alert creation date */
    createdAt: string
}

/** The alert detail information for the page listing alerts */
export interface AlertListResponseDto {
    /** The alert id */
    id: string

    /** The model of the vehicle the alert is associated with */
    model: string | null

    /** The type of the maintenance the alert is associated to */
    maintenanceType: MaintenanceType

    /** The current mileage the vehicle had the moment the alert was associated to */
    currentMileage: number | null

    /** The alert km warning value */
    intervalKm: number | null

    /** The alert days warning value */
    intervalDays: number | null

    /** The critical status of the alert (Critical, Warning, None) */
    alertStatus : string

    /** The color set on the frontend based on the status */
    alertColor: string | null

    /** The date when the alert was resolved */
    resolvedAt: string | null
}