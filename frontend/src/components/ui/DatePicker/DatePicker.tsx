import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PICKER_COLORS } from './PickerColors'
import YearPicker from './YearPicker'
import MonthPicker from './MonthPicker'
import DayPicker from './DayPicker'
import HourPicker from './HourPicker'

export type DateGranularity = 'year' | 'month' | 'day' | 'hour'

interface DatePickerProps {
    granularity: DateGranularity
    label: string
    onChange: (value: string) => void
}

/**
 * Formats the date to match the granularity
 * @param iso the iso date
 * @param granularity The granularity
 * @param monthsFull A list with all months full name
 */
const formatDisplay = (iso: string, granularity: DateGranularity, monthsFull: string[]): string => {
    if (!iso) return ''
    const parts = iso.split('-')
    switch (granularity) {
        case 'year':
            return iso
        case 'month':
            return `${monthsFull[parseInt(parts[1]) - 1]} ${parts[0]}`
        case 'day':
            return `${parts[2]}/${parts[1]}/${parts[0]}`
        case 'hour': {
            const [date, time] = iso.split('T')
            const dp = date.split('-')
            return `${dp[2]}/${dp[1]}/${dp[0]} ${time}`
        }
    }
}

/**
 * The main component called to manage the date picker
 * @param granularity The granularity of the picker (Year / Month / Day / Hour)
 * @param label The field label
 * @param onChange The function that executes when the value changes
 * @constructor
 */
const DatePicker = ({ granularity, label, onChange }: DatePickerProps) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [display, setDisplay] = useState('')

    const monthsFull = t('datepicker.months_full', { returnObjects: true }) as string[]

    const handleChange = (iso: string) => {
        setDisplay(formatDisplay(iso, granularity, monthsFull))
        onChange(iso)
        if (granularity !== 'hour') setOpen(false)
    }

    return (
        <div className="flex flex-col gap-2 relative">
            <label className={`text-base ${PICKER_COLORS.header}`}>{label}</label>
            <button
                type="button"
                className={`border border-solid rounded-lg text-left px-2 py-2 w-full ${PICKER_COLORS.input}`}
                onClick={() => setOpen(o => !o)}
            >
                {display || <span className={PICKER_COLORS.label}>{t('datepicker.select_date')}</span>}
            </button>

            {open && (
                <div className={`absolute top-full mt-2 left-0 right-0 border rounded-xl p-4 z-50 shadow-xl ${PICKER_COLORS.container}`}>
                    {granularity === 'year' && (
                        <YearPicker onChange={handleChange} />
                    )}
                    {granularity === 'month' && (
                        <MonthPicker onChange={handleChange} />
                    )}
                    {granularity === 'day' && (
                        <DayPicker onChange={handleChange} />
                    )}
                    {granularity === 'hour' && (
                        <HourPicker
                            onChange={handleChange}
                            onConfirm={() => setOpen(false)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default DatePicker