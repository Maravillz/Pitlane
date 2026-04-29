import type {
    CreateVehicleRequest,
    UpdateVehicleRequest,
    VehicleDetailResponse,
    VehicleResponse
} from "../models/vehicle.ts";

const API_URL: string = import.meta.env.VITE_API_URL

/**
 * Gets all vehicles from the logged user
 */
const getAllUserVehicles = async (): Promise<VehicleResponse[]> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/vehicles`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    if (!res.ok)
        throw new Error('Invalid credentials')

    return res.json();
}

/**
 * Gets a specific vehicle by its id if the user owns it
 */
const getVehicle = async (vehicleID: string): Promise<VehicleDetailResponse> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/vehicles/${vehicleID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    if (!res.ok)
        throw new Error('Vehicle not found')

    return res.json();
}

/**
 * Creates a vehicle for the logged user
 * @param vehicle Vehicle creation information
 */
const createVehicle = async (vehicle: CreateVehicleRequest): Promise<string> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicle)
    })
    if (!res.ok)
        throw new Error('Invalid credentials')

    return res.text();
}

/**
 * Updates basic info about the user vehicle
 * @param vehicle The vehicle update information
 */
const updateVehicle = async (vehicle: UpdateVehicleRequest): Promise<VehicleDetailResponse> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/vehicles/${vehicle.vehicleId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicle)
    })
    if (!res.ok)
        throw new Error('Invalid vehicle information')

    return res.json();
}

/**
 * Updates the vehicle mileage
 */
const updateMileage = async (vehicleId: string, newMileage: number): Promise<string> => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/vehicles/${vehicleId}/mileage?newMileage=${newMileage}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    if (!res.ok)
        throw new Error('Invalid mileage')

    return res.text();
}



export const vehicleService = { getAllUserVehicles, createVehicle, getVehicle, updateVehicle, updateMileage }