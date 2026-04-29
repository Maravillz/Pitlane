import { sortAlertsByStatus, sortAlertsByProximity } from '../utils/alertUtils'
import type { AlertListResponseDto, AlertResponse } from '../models/alert'

describe('sortAlertsByStatus', () => {

    /**
     * CRITICAL deve aparecer antes de WARNING
     */
    it('sorts CRITICAL before WARNING', () => {
        const alerts: AlertListResponseDto[] = [
            { id: '1', alertStatus: 'WARNING', intervalKm: 500, intervalDays: null, maintenanceType: 'OIL_CHANGE', resolvedAt: null, alertColor: '', model: null, currentMileage: null },
            { id: '2', alertStatus: 'CRITICAL', intervalKm: 1000, intervalDays: null, maintenanceType: 'BRAKE_SERVICE', resolvedAt: null, alertColor: '', model: null, currentMileage: null }
        ]

        const result = sortAlertsByStatus(alerts)
        expect(result[0].alertStatus).toBe('CRITICAL')
        expect(result[1].alertStatus).toBe('WARNING')
    })

    /**
     * CRITICAL deve aparecer antes de NONE
     */
    it('sorts CRITICAL before NONE', () => {
        const alerts: AlertListResponseDto[] = [
            { id: '1', alertStatus: 'NONE', intervalKm: 100, intervalDays: null, maintenanceType: 'OIL_CHANGE', resolvedAt: null, alertColor: '', model: null, currentMileage: null },
            { id: '2', alertStatus: 'CRITICAL', intervalKm: 5000, intervalDays: null, maintenanceType: 'BRAKE_SERVICE', resolvedAt: null, alertColor: '', model: null, currentMileage: null }
        ]

        const result = sortAlertsByStatus(alerts)
        expect(result[0].alertStatus).toBe('CRITICAL')
    })

    /**
     * WARNING deve aparecer antes de NONE
     */
    it('sorts WARNING before NONE', () => {
        const alerts: AlertListResponseDto[] = [
            { id: '1', alertStatus: 'NONE', intervalKm: 100, intervalDays: null, maintenanceType: 'OIL_CHANGE', resolvedAt: null, alertColor: '', model: null, currentMileage: null },
            { id: '2', alertStatus: 'WARNING', intervalKm: 5000, intervalDays: null, maintenanceType: 'BRAKE_SERVICE', resolvedAt: null, alertColor: '', model: null, currentMileage: null }
        ]

        const result = sortAlertsByStatus(alerts)
        expect(result[0].alertStatus).toBe('WARNING')
    })

    /**
     * Com o mesmo status ordena pelo menor intervalo
     */
    it('sorts by smallest interval when status is equal', () => {
        const alerts: AlertListResponseDto[] = [
            { id: '1', alertStatus: 'WARNING', intervalKm: 1000, intervalDays: null, maintenanceType: 'OIL_CHANGE', resolvedAt: null, alertColor: '', model: null, currentMileage: null },
            { id: '2', alertStatus: 'WARNING', intervalKm: 500, intervalDays: null, maintenanceType: 'BRAKE_SERVICE', resolvedAt: null, alertColor: '', model: null, currentMileage: null }
        ]

        const result = sortAlertsByStatus(alerts)
        expect(result[0].id).toBe('2')
        expect(result[1].id).toBe('1')
    })

    /**
     * Lista vazia deve devolver lista vazia
     */
    it('returns empty list when input is empty', () => {
        expect(sortAlertsByStatus([])).toHaveLength(0)
    })

    /**
     * Não deve mutar o array original
     */
    it('does not mutate the original array', () => {
        const alerts: AlertListResponseDto[] = [
            { id: '1', alertStatus: 'WARNING', intervalKm: 500, intervalDays: null, maintenanceType: 'OIL_CHANGE', resolvedAt: null, alertColor: '', model: null, currentMileage: null },
            { id: '2', alertStatus: 'CRITICAL', intervalKm: 1000, intervalDays: null, maintenanceType: 'BRAKE_SERVICE', resolvedAt: null, alertColor: '', model: null, currentMileage: null }
        ]
        const original = [...alerts]
        sortAlertsByStatus(alerts)
        expect(alerts[0].id).toBe(original[0].id)
    })
})

describe('sortAlertsByProximity', () => {

    /**
     * Alerta com menos km restantes deve aparecer primeiro
     */
    it('sorts alert with fewer km remaining first', () => {
        const alerts: AlertResponse[] = [
            { id: '1', maintenanceType: 'OIL_CHANGE', intervalKm: 10000, intervalDays: null, resolvedAt: null, createdAt: '' },
            { id: '2', maintenanceType: 'BRAKE_SERVICE', intervalKm: 5000, intervalDays: null, resolvedAt: null, createdAt: '' }
        ]

        const result = sortAlertsByProximity(alerts, 4000)
        expect(result[0].id).toBe('2') // 5000 - 4000 = 1000 restantes
        expect(result[1].id).toBe('1') // 10000 - 4000 = 6000 restantes
    })

    /**
     * Alerta com menos dias restantes deve aparecer primeiro quando não há km
     */
    it('sorts alert with fewer days remaining first when no km', () => {
        const alerts: AlertResponse[] = [
            { id: '1', maintenanceType: 'INSPECTION', intervalKm: null, intervalDays: 365, resolvedAt: null, createdAt: '' },
            { id: '2', maintenanceType: 'BATTERY', intervalKm: null, intervalDays: 30, resolvedAt: null, createdAt: '' }
        ]

        const result = sortAlertsByProximity(alerts, 100000)
        expect(result[0].id).toBe('2')
        expect(result[1].id).toBe('1')
    })

    /**
     * Alerta sem intervalos deve aparecer no fim
     */
    it('sorts alert with no intervals to the end', () => {
        const alerts: AlertResponse[] = [
            { id: '1', maintenanceType: 'OTHER', intervalKm: null, intervalDays: null, resolvedAt: null, createdAt: '' },
            { id: '2', maintenanceType: 'OIL_CHANGE', intervalKm: 5000, intervalDays: null, resolvedAt: null, createdAt: '' }
        ]

        const result = sortAlertsByProximity(alerts, 1000)
        expect(result[0].id).toBe('2')
        expect(result[1].id).toBe('1')
    })

    /**
     * Não deve mutar o array original
     */
    it('does not mutate the original array', () => {
        const alerts: AlertResponse[] = [
            { id: '1', maintenanceType: 'OIL_CHANGE', intervalKm: 10000, intervalDays: null, resolvedAt: null, createdAt: '' },
            { id: '2', maintenanceType: 'BRAKE_SERVICE', intervalKm: 5000, intervalDays: null, resolvedAt: null, createdAt: '' }
        ]
        const original = [...alerts]
        sortAlertsByProximity(alerts, 4000)
        expect(alerts[0].id).toBe(original[0].id)
    })
})