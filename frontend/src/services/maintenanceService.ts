import type {CreateMaintenanceRequest} from "../models/maintenance.ts";

const API_URL: string = import.meta.env.VITE_API_URL

/**
 * Creates a new maintenance for the vehicle and the corresponding alert is requested.
 * Sends as multipart/form-data to support optional photo uploads.
 * @param vehicleId The vehicle id
 * @param maintenance The maintenance and alert information
 * @param photos Optional list of photos to upload
 */
const createMaintenance = async (vehicleId: string, maintenance: CreateMaintenanceRequest, photos: File[] = []): Promise<string> => {
    const token = localStorage.getItem('token')

    const formData = new FormData()

    // Append maintenance JSON as a part
    formData.append('maintenance', new Blob([JSON.stringify(maintenance)], {
        type: 'application/json'
    }))

    // Append each photo
    photos.forEach(photo => {
        formData.append('photos', photo)
    })

    const res = await fetch(`${API_URL}/api/maintenance?vehicleId=${vehicleId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })

    if (!res.ok)
        throw new Error('Invalid Maintenance')

    return res.text()
}

export const maintenanceService = { createMaintenance }
