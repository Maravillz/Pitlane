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
const AlertCard = ({ maintenanceType, intervalKm, intervalDays, borderColor = 'var(--color-alert-none)', children }: AlertCardProps) => {
    const { t } = useTranslation()

    const intervalText =
        (intervalKm != null ? `${t('carDetail.in')} ${intervalKm} km` : '') +
        (intervalKm != null && intervalDays != null ? ' · ' : '') +
        (intervalDays != null ? `${t('carDetail.next')} ${intervalDays} ${t('carDetail.days')}` : '')

    return (
        <div
            className="flex flex-row items-center justify-between bg-bg-card rounded-r-2xl rounded-l-none border-l-[3px] px-4 py-3.5 border border-border border-l-0 hover:border-border-subtle transition-colors"
            style={{ borderLeftColor: borderColor }}
        >
            <div className="flex flex-col gap-0.5">
                <span className="text-sm text-text-primary font-medium">
                    {t(`maintenanceTypes.${maintenanceType}`)}
                </span>
                {intervalText && (
                    <span className="text-xs text-text-secondary">{intervalText}</span>
                )}
            </div>
            {children}
        </div>
    )
}

export default AlertCard