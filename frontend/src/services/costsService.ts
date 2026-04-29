import type {CostPeriod, CostsSummary} from "../models/costs.ts";

const API_URL: string = import.meta.env.VITE_API_URL

/**
 * Gets all the report information relative to the maintenance spending
 * @param period
 */
const getCosts = async (period: CostPeriod): Promise<CostsSummary> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/costs?period=${period}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    if (!res.ok) throw new Error('Error fetching costs')
    return res.json()
}

export const costsService = { getCosts }