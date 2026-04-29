import type {MaintenanceType} from "./maintenance.ts";

/** Const with all the recommended km and times between the different types of maintenances */
export const MAINTENANCE_DEFAULTS: Record<MaintenanceType, { intervalKm?: number, intervalDays?: number }> = {
    OIL_CHANGE:             { intervalKm: 10000,  intervalDays: 365  },
    TIRE_ROTATION:          { intervalKm: 10000,  intervalDays: undefined },
    BRAKE_SERVICE:          { intervalKm: 50000,  intervalDays: undefined },
    AIR_FILTER:             { intervalKm: 20000,  intervalDays: undefined },
    SPARK_PLUGS:            { intervalKm: 30000,  intervalDays: undefined },
    TIMING_BELT:            { intervalKm: 100000, intervalDays: undefined },
    COOLANT_FLUSH:          { intervalKm: 50000,  intervalDays: 730  },
    TRANSMISSION_SERVICE:   { intervalKm: 60000,  intervalDays: undefined },
    BATTERY:                { intervalKm: undefined,   intervalDays: 1460 },
    INSPECTION:             { intervalKm: undefined,   intervalDays: 365  },
    OTHER:                  { intervalKm: undefined,   intervalDays: undefined }
}