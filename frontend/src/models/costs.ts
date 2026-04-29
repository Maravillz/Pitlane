/** The cost information by category for the dashboard */
export interface CategoryCost {
    category: string
    totalCents: number
    percentage: number
}

/** The cost information by vehicle for the dashboard */
export interface VehicleCost {
    vehicleId: string
    vehicleName: string
    totalCents: number
    percentage: number
}

/** The information about the costs for the dashboard */
export interface CostsSummary {
    totalCents: number
    byCategory: CategoryCost[]
    byVehicle: VehicleCost[]
}

export type CostPeriod = 'month' | 'year' | 'total'