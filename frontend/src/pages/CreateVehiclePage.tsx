import {useTranslation} from "react-i18next";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import type {CreateVehicleRequest} from "../models/vehicle.ts";
import {vehicleService} from "../services/vehicleService.ts";
import type {FormField} from "../models/form.ts";
import Form from "../components/layout/Form.tsx";

/**
 * Represents the vehicle creation
 * @constructor
 */
const CreateVehiclePage = () =>{

    const { t } = useTranslation()
    const navigate = useNavigate()
    const [form, setForm] = useState<CreateVehicleRequest>({ brand: '', model: '', year: undefined, plate: '', currentMileage: undefined })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const fields: FormField<CreateVehicleRequest>[] = [
        {
            fieldName: 'brand',
            label: t('createCar.brand'),
            fieldType: 'text',
            placeholder: t("createCar.brandPlaceholder"),
            required: true
        },
        {
            fieldName: 'model',
            label: t('createCar.model'),
            placeholder: t("createCar.modelPlaceholder"),
            fieldType: 'text',
            required: true
        },
        {
            fieldName: 'year',
            label: t('createCar.year'),
            placeholder: t("createCar.yearPlaceholder"),
            fieldType: 'date_custom',
            granularity: 'year',
            required: true
        },
        {
            fieldName: 'plate',
            label: t('createCar.plate'),
            placeholder: t("createCar.platePlaceholder"),
            fieldType: 'text',
            required: false
        },
        {
            fieldName: 'currentMileage',
            label: t('createCar.mileage'),
            placeholder: t("createCar.mileagePlaceholder"),
            fieldType: 'number',
        }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res: string = await vehicleService.createVehicle(form);
            navigate(`/vehicle/${res}`)
        } catch {
            setError(t('register.error'))
        } finally {
            setLoading(false)
        }
    }

    return <Form
        fields={fields}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
    />
}

export default CreateVehiclePage;