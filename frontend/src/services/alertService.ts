import type {AlertListResponseDto} from "../models/alert.ts";

const API_URL: string = import.meta.env.VITE_API_URL

/**
 * Gets all the alerts (active or not) for the logged user
 */
const getAlertsByUSer = async (): Promise<AlertListResponseDto[]> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/alerts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if(!res.ok)
        throw new Error('Error getting alerts')
    return res.json()
}

/**
 * Resolves a specific alert by setting the resolution date to the time of the request,
 * the time is considered the server one because the request delay is not considered relevant for this scope
 * @param alertId
 */
const resolveAlert = async (alertId: string): Promise<void> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/alerts/${alertId}/resolve`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!res.ok) throw new Error('Error resolving alert')
}

export const alertService = { getAlertsByUSer, resolveAlert }