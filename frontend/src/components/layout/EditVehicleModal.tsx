import {useTranslation} from "react-i18next";
import {useState} from "react";
import {vehicleService} from "../../services/vehicleService.ts";
import type {UpdateVehicleRequest} from "../../models/vehicle.ts";

interface EditVehicleModalProps {
    vehicleId: string
    brand: string
    model: string
    year: number
    plate: string
    onClose: () => void
    onSuccess: (updateVehicle: UpdateVehicleRequest) => void
}

/**
 * Modal component to edit a vehicle information
 * @param vehicleId The vehicle id to identify it
 * @param brand Current brand
 * @param model Current model
 * @param year  Current year of manufacturing
 * @param plate  Current license plate
 * @param onClose The function that executes when the modal closes
 * @param onSuccess The function that executes when submitted
 * @constructor
 */
const EditVehicleModal = ({ vehicleId, brand, model, year, plate, onClose, onSuccess }: EditVehicleModalProps) => {

    const { t } = useTranslation()
    const [newBrand, setNewBrand] = useState<string>(brand)
    const [newModel, setNewModel] = useState<string>(model)
    const [newYear, setNewYear] = useState<number>(year)
    const [newPlate, setNewPlate] = useState<string>(plate)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const updateVehicle: UpdateVehicleRequest = {
                vehicleId: vehicleId,
                brand: newBrand,
                model: newModel,
                year: newYear,
                plate: newPlate
            }
            await vehicleService.updateVehicle(updateVehicle)
            onSuccess(updateVehicle)
            onClose()
        } catch {
            setError(t('updateVehicle.error'))
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "bg-bg-input border border-border rounded-xl text-text-primary px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors w-full"
    const labelClass = "text-text-primary text-sm font-medium"

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end items-center justify-center flex-wrap content-center py-4" onClick={onClose}>
            <div
                className="bg-bg-card rounded-3xl md:rounded-3xl w-[90%] md:max-w-sm p-6 flex flex-col gap-4 border border-border border-b-0 md:border-b"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-text-primary font-bold text-base">{t('updateVehicle.title')}</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-border">
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>{t('updateVehicle.brand')}</label>
                        <input type="text" className={inputClass} value={newBrand} onChange={e => setNewBrand(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>{t('updateVehicle.model')}</label>
                        <input type="text" className={inputClass} value={newModel} onChange={e => setNewModel(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>{t('updateVehicle.year')}</label>
                        <input type="number" className={inputClass} value={newYear} onChange={e => setNewYear(e.target.value === '' ? year : Number(e.target.value))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>{t('updateVehicle.plate')}</label>
                        <input type="text" className={inputClass} value={newPlate} onChange={e => setNewPlate(e.target.value)} />
                    </div>
                </div>

                {error && (
                    <p className="text-alert-critical text-sm bg-alert-critical-bg px-4 py-2.5 rounded-xl">
                        {error}
                    </p>
                )}

                <button
                    className="bg-brand hover:bg-brand/90 active:scale-[0.99] text-bg-card rounded-xl py-3.5 font-bold text-sm disabled:opacity-50 transition-all mt-1"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? t('common.loading') : t('updateVehicle.confirm')}
                </button>
            </div>
        </div>
    )
}

export default EditVehicleModal;