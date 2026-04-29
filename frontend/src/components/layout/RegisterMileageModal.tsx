import {useTranslation} from "react-i18next";
import {useState} from "react";
import {vehicleService} from "../../services/vehicleService.ts";

interface RegisterMileageModalProps {
    vehicleId: string
    currentMileage: number
    onClose: () => void
    onSuccess: (newMileage: number) => void
}

/**
 * Modal do update vehicle mileage
 * @param vehicleId The vehicle id
 * @param currentMileage The current vehicle mileage
 * @param onClose The function that executes when the modal closes
 * @param onSuccess The function that executes when submitted
 * @constructor
 */
const RegisterMileageModal = ({ vehicleId, currentMileage, onClose, onSuccess }: RegisterMileageModalProps) => {

    const { t } = useTranslation()
    const [newMileage, setNewMileage] = useState<number | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!newMileage || newMileage <= currentMileage) {
            setError(t('registerMileage.error'))
            return
        }
        setLoading(true)
        setError(null)
        try {
            await vehicleService.updateMileage(vehicleId, newMileage)
            onSuccess(newMileage)
            onClose()
        } catch {
            setError(t('registerMileage.error'))
        } finally {
            setLoading(false)
        }
    }


    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-[#1e1e1e] rounded-t-2xl w-[90%] p-6 flex flex-col gap-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <span className="text-[#ccc] font-medium">{t('registerMileage.title')}</span>
                    <button onClick={onClose} className="text-[#888] text-xl">✕</button>
                </div>

                <p className="text-[#888] text-sm">{t('registerMileage.current')}: {currentMileage} km</p>

                <div className="flex flex-col gap-2">
                    <label className="text-[#ccc] text-sm">{t('registerMileage.newMileage')}</label>
                    <input
                        type="number"
                        className="bg-[#2e2e2e] border border-[#3a3a3a] rounded-lg text-white px-4 py-3"
                        placeholder={`> ${currentMileage}`}
                        value={newMileage ?? ''}
                        onChange={e => setNewMileage(e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                </div>

                {error && <p className="text-[#e74c3c] text-sm">{error}</p>}

                <button
                    className="bg-[#f5a623] text-[#1a1a1a] rounded-xl py-3 font-semibold disabled:opacity-60"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? t('common.loading') : t('registerMileage.confirm')}
                </button>
            </div>
        </div>
    )
}

export default RegisterMileageModal;