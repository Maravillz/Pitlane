import { useTranslation } from 'react-i18next'

interface AlertCardProps {
    id: string
    maintenanceType: string
    intervalKm?: number | null
    intervalDays?: number | null
    borderColor?: string
    children?: React.ReactNode
}

/**
 * Reusable card component for displaying a vehicle alert with maintenance type and interval info.
 * @param id The alert id used as key
 * @param maintenanceType The type of maintenance associated with the alert
 * @param intervalKm The km interval for the alert — optional
 * @param intervalDays The days interval for the alert — optional
 * @param borderColor The left border colour indicating severity. Defaults to green.
 * @param children Optional action elements rendered on the right side of the card
 */
const AlertCard = ({ maintenanceType, intervalKm, intervalDays, borderColor = '#10b981', children }: AlertCardProps) => {
    const { t } = useTranslation()

    const intervalText =
        (intervalKm != null ? `${t('carDetail.in')} ${intervalKm} km` : '') +
        (intervalKm != null && intervalDays != null ? ' - ' : '') +
        (intervalDays != null ? `${t('carDetail.next')} ${intervalDays}` : '')

    return (
        <div
            className="flex flex-row items-center justify-between bg-[#1a1a1a] p-2 rounded-r-xl border-l-4"
            style={{ borderColor }}
        >
            <div className="flex flex-col">
                <span className="text-sm text-[#CCC]">{t(`maintenanceTypes.${maintenanceType}`)}</span>
                <span className="text-sm text-[#888]">{intervalText}</span>
            </div>
            {children}
        </div>
    )
}

export default AlertCard