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

    return <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
        onClick={onClose}>
        <div
            className="bg-[#1e1e1e] rounded-t-2xl w-[90%] p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
                <span className="text-[#ccc] font-medium">{t('updateVehicle.title')}</span>
                <button onClick={onClose} className="text-[#888] text-xl">✕</button>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[#ccc] text-sm">{t('updateVehicle.brand')}</label>
                <input
                    type="text"
                    className="bg-[#2e2e2e] border border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                    placeholder={`${brand}`}
                    value={newBrand ?? ''}
                    onChange={e => setNewBrand(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[#ccc] text-sm">{t('updateVehicle.model')}</label>
                <input
                    type="text"
                    className="bg-[#2e2e2e] border border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                    placeholder={`${model}`}
                    value={newModel ?? ''}
                    onChange={e => setNewModel(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[#ccc] text-sm">{t('updateVehicle.year')}</label>
                <input
                    type="number"
                    className="bg-[#2e2e2e] border border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                    placeholder={`${year}`}
                    value={newYear ?? ''}
                    onChange={e => setNewYear(e.target.value === '' ? year : Number(e.target.value))}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[#ccc] text-sm">{t('updateVehicle.plate')}</label>
                <input
                    type="text"
                    className="bg-[#2e2e2e] border border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                    placeholder={`${plate}`}
                    value={newPlate ?? ''}
                    onChange={e => setNewPlate(e.target.value)}
                />
            </div>


            {error && <p className="text-[#e74c3c] text-sm">{error}</p>}

            <button
                className="bg-[#f5a623] text-[#1a1a1a] rounded-xl py-3 font-semibold disabled:opacity-60"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? t('common.loading') : t('updateVehicle.confirm')}
            </button>
        </div>
    </div>
}

export default EditVehicleModal;