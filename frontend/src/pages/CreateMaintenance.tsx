import { useTranslation } from "react-i18next"
import {useLocation, useNavigate} from "react-router-dom"
import { useState } from "react"
import type { FormField } from "../models/form"
import Form from "../components/layout/Form.tsx";
import {type CreateMaintenanceRequest, MAINTENANCE_TYPES, type MaintenanceType} from "../models/maintenance.ts";
import {MAINTENANCE_DEFAULTS} from "../models/maintenanceDefaults.ts";
import { maintenanceService } from "../services/maintenanceService.ts";

/**
 * Represents the maintenance creation page
 * @constructor
 */
const CreateMaintenance = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { state } = useLocation()
    const currentMileage = state?.currentMileage ?? 0
    const vehicleId = state?.vehicleId

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [photos, setPhotos] = useState<File[]>([])

    /**
     * Sets OIL_CHANGE as the default
     */
    const [form, setForm] = useState<CreateMaintenanceRequest>({
        maintenanceType: 'OIL_CHANGE',
        date: '',
        mileage: currentMileage,
        costCents: undefined,
        notes: undefined,
        alertIntervalKm: MAINTENANCE_DEFAULTS['OIL_CHANGE'].intervalKm,
        alertIntervalDays: MAINTENANCE_DEFAULTS['OIL_CHANGE'].intervalDays,
        createAlert: true
    })

    const fields: FormField<CreateMaintenanceRequest>[] = [
        {
            fieldName: 'maintenanceType',
            label: t('createMaintenance.maintenanceType'),
            fieldType: 'dropdown',
            dropdownValues: MAINTENANCE_TYPES.map(type => ({
                value: type,
                label: t(`maintenanceTypes.${type}`)
            })),
            onChange: (value) => {
                const defaults = MAINTENANCE_DEFAULTS[value as MaintenanceType]
                setForm(prev => ({
                    ...prev,
                    maintenanceType: value as MaintenanceType,
                    alertIntervalKm: defaults?.intervalKm,
                    alertIntervalDays: defaults?.intervalDays
                }))
            },
            required: true
        },
        {
            fieldName: 'date',
            label: t('createMaintenance.date'),
            fieldType: 'date_custom',
            granularity: 'day',
            required: true
        },
        {
            fieldName: 'mileage',
            label: t('createMaintenance.mileage'),
            fieldType: 'number',
            required: true
        },
        {
            fieldName: 'costCents',
            label: t('createMaintenance.cost'),
            fieldType: 'number',
            required: false
        },
        {
            fieldName: 'notes',
            label: t('createMaintenance.notes'),
            fieldType: 'area',
            required: false,
            rowNr: 3
        }
    ]

    const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhotos(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const handlePhotoRemove = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
    }

    /** Sets the message that will appear on the alert creation prompt */
    const alertLabel = () => {
        const defaults = MAINTENANCE_DEFAULTS[form.maintenanceType]
        const parts = []

        if (defaults?.intervalKm) {
            parts.push(`${defaults.intervalKm} km`)
        }
        if (defaults?.intervalDays) {
            parts.push(`${defaults.intervalDays} ${t('createMaintenance.days')}`)
        }

        if (parts.length === 0) return t('createMaintenance.noAlert')

        return `${t(`maintenanceTypes.${form.maintenanceType}`)} ${t('createMaintenance.in')} ${parts.join(' ' + t('createMaintenance.or') + ' ')}`
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const payload = {
                ...form,
                costCents: form.costCents ? Math.round(form.costCents * 100) : undefined
            }
            await maintenanceService.createMaintenance(vehicleId, payload)
            navigate(-1)
        } catch {
            setError(t('createMaintenance.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <Form
                fields={fields}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                hideSubmit={true}
            />

            {/* Photos */}
            <div className="flex flex-col gap-2">
                <label className="text-text-primary text-sm font-medium">{t('createMaintenance.photos')}</label>
                <div className="flex flex-row gap-3 flex-wrap">
                    {photos.map((photo, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                            <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt="" />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-bg-page/80 rounded-full w-5 h-5 flex items-center justify-center text-text-secondary text-xs"
                                onClick={() => handlePhotoRemove(i)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {photos.length < 3 && (
                        <label className="w-20 h-20 rounded-xl bg-bg-card border border-dashed border-border-subtle flex items-center justify-center cursor-pointer hover:border-brand transition-colors">
                            <span className="text-text-muted text-2xl">+</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
                        </label>
                    )}
                </div>
            </div>

            {/* Alert toggle */}
            <div className="flex flex-col gap-2">
                <label className="text-text-primary text-sm font-medium">{t('createMaintenance.createAlert')}</label>
                <div className="flex items-center justify-between bg-bg-card border border-border rounded-xl px-4 py-3.5">
                    <span className="text-text-secondary text-sm flex-1 mr-4">{alertLabel()}</span>
                    <button
                        type="button"
                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.createAlert ? 'bg-brand' : 'bg-border'}`}
                        onClick={() => setForm(prev => ({ ...prev, createAlert: !prev.createAlert }))}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${form.createAlert ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-alert-critical text-sm bg-alert-critical-bg px-4 py-2.5 rounded-xl">
                    {error}
                </p>
            )}

            <button
                className="bg-brand hover:bg-brand/90 active:scale-[0.99] text-bg-card rounded-xl py-3.5 font-bold text-sm disabled:opacity-50 transition-all"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                        {t('common.loading')}
                    </span>
                ) : t('form.submit')}
            </button>
        </div>
    )
}

export default CreateMaintenance