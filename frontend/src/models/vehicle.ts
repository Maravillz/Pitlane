import type {AlertResponse} from "./alert.ts";
import type {MaintenanceResponse} from "./maintenance.ts";

/** Vehicle information for the cards in the dashboard page with info relative to the costs and maintenances to display on top of the cards */
export interface VehicleResponse {
    id: string
    brand: string
    model: string
    year: number
    plate: string | null
    currentMileage: number
    createdAt: string
    alertStatus: 'NONE' | 'WARNING' | 'CRITICAL'
    alertMessage?: string
    totalMonthMaintenances: number
    totalMonthSpent: number
    totalMonthAlerts:number
    alertColor?: string
}

/** Vehicle creation request */
export interface CreateVehicleRequest {
    brand: string
    model: string
    year?: number
    plate?: string
    currentMileage?: number
}

/** Vehicle information to display in the detail page */
export interface VehicleDetailResponse {
    model: string
    brand: string
    year: number
    mileage: string
    plate: string
    lastUpdated: string | null
    nrActiveAlerts: number
    totalMaintenances: number
    totalCosts: number
    totalAlerts: number
    alerts: AlertResponse[]
    maintenances: MaintenanceResponse[]
}

/** Information to update the user vehicle */
export interface UpdateVehicleRequest {
    vehicleId: string
    brand: string
    model: string
    year: number
    plate: string
}