import type {CreateMaintenanceRequest} from "../models/maintenance.ts";

const API_URL: string = import.meta.env.VITE_API_URL

/**
 * Creates a new maintenance for the vehicle and the corresponding alert is requested
 * @param vehicleId The vehicle id
 * @param maintenance The maintenance and alert information
 */
const createMaintenance = async (vehicleId: string, maintenance: CreateMaintenanceRequest): Promise<string> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/maintenance?vehicleId=${vehicleId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(maintenance)
    })
    if (!res.ok)
        throw new Error('Invalid Maintenance')

    return res.text();
}

export const maintenanceService = { createMaintenance }