import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PICKER_COLORS } from './PickerColors'

const selectedCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-14 font-semibold ${PICKER_COLORS.selected}`
const normalCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-14 transition-colors ${PICKER_COLORS.normal}`

interface MonthPickerProps {
    onChange: (value: string) => void
}

/**
 * Datepicker for only the month
 * @param onChange
 * @constructor
 */
const MonthPicker = ({ onChange }: MonthPickerProps) => {
    const { t } = useTranslation()
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [selected, setSelected] = useState<number | null>(null)

    const months: string[] = t('datepicker.months_short', { returnObjects: true }) as string[]

    /**
     * Returns que complete value of the date based on the month picked and the year the app tracked
     * @param m
     */
    const select = (m: number) => {
        setSelected(m)
        onChange(`${year}-${String(m + 1).padStart(2, '0')}`)
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <button type="button"
                        className={`px-2 py-1 rounded ${PICKER_COLORS.nav}`}
                        onClick={() => setYear(y => y - 1)}>
                    ‹
                </button>
                <span className={`text-sm font-medium ${PICKER_COLORS.header}`}>{year}</span>
                <button type="button"
                        className={`px-2 py-1 rounded ${PICKER_COLORS.nav}`}
                        onClick={() => setYear(y => y + 1)}>
                    ›
                </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {months.map((m, i) => (
                    <button
                        type="button"
                        key={m}
                        className={selected === i ? selectedCell : normalCell}
                        onClick={() => select(i)}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default MonthPicker