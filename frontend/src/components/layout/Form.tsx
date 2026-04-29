import type {FormField} from "../../models/form.ts";
import DatePicker from "../ui/DatePicker/DatePicker.tsx";
import {useTranslation} from "react-i18next";

type FormProps<T> = {
    fields: FormField<T>[]
    form: T
    setForm: React.Dispatch<React.SetStateAction<T>>
    onSubmit: (e: React.FormEvent) => void
    loading?: boolean
    error?: string | null
    hideSubmit?: boolean
}

/**
 * Represents the generic form component
 * @param fields The form fields
 * @param form The form object
 * @param setForm Set form function
 * @param onSubmit Submit function
 * @param loading Loading object
 * @param error Error object
 * @param hideSubmit Boolean that decides if the submit button is hidden if is needed to add other custom context
 * @constructor
 */
const Form = <T extends Record<string, any>>({
                                                 fields,
                                                 form,
                                                 setForm,
                                                 onSubmit,
                                                 loading = false,
                                                 error = null,
                                                 hideSubmit = false
                                             }: FormProps<T>) => {

    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target

        setForm(prev => ({
            ...prev,
            [name]: type === "number"
                ? (value === "" ? undefined : Number(value))
                : value
        }))
    }

    const setFieldValue = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(e)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {fields.map((field) => {

                switch(field.fieldType){
                    case "dropdown":
                        return <div key={String(field.fieldName)} className="flex flex-col gap-2">
                            <label className="text-[#ccc] text-base">
                                {field.label}
                            </label>

                            <select
                                name={String(field.fieldName)}
                                className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-2 py-2"
                                value={form[field.fieldName] ?? ''}
                                onChange={(e) => {
                                    handleChange(e)
                                    field.onChange?.(e.target.value)
                                }}
                            >
                                {field.dropdownValues.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                    case "area":
                        return <div key={String(field.fieldName)} className="flex flex-col gap-2">
                            <label className="text-[#ccc] text-base">
                                {field.label}
                            </label>

                            <textarea
                                className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-2 py-2 resize-none"
                                name={String(field.fieldName)}
                                placeholder={field.placeholder}
                                value={form[field.fieldName] ?? ''}
                                onChange={handleChange}
                                required={field.required}
                                rows={field.rowNr}
                            />
                        </div>

                    case "date_custom":
                        return (
                            <DatePicker
                                key={String(field.fieldName)}
                                granularity={field.granularity}
                                label={field.label}
                                onChange={(value) => setFieldValue(String(field.fieldName), value)}
                            />
                        )


                    default:
                        return <div key={String(field.fieldName)} className="flex flex-col gap-2">
                            <label className="text-[#ccc] text-base">
                                {field.label}
                            </label>

                            <input
                                className="bg-[#2e2e2e] border border-solid border-[#3a3a3a] rounded-lg text-white px-2 py-2"
                                name={String(field.fieldName)}
                                type={field.fieldType}
                                placeholder={field.placeholder}
                                value={form[field.fieldName] ?? ''}
                                onChange={handleChange}
                                required={field.required}
                            />
                        </div>

                }
            })}

            {error && <p className="text-[#e74c3c] text-sm m-0">{error}</p>}

            {!hideSubmit && (
                <button
                    type="submit"
                    className="bg-[#f5a623] text-[#1a1a1a] rounded-xl p-3.5 mt-2 text-base font-semibold disabled:opacity-60"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : t('form.submit')}
                </button>
            )}
        </form>
    )
}

export default Form