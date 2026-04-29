import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PICKER_COLORS } from './PickerColors'

const selectedCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-9 font-semibold ${PICKER_COLORS.selected}`
const normalCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-9 transition-colors ${PICKER_COLORS.normal}`
const emptyCell = "h-9 w-9"

interface DayPickerProps {
    onChange: (value: string) => void
}

/**
 * Datepicker with date
 * @param onChange Function triggered when the date changes
 * @constructor
 */
const DayPicker = ({ onChange }: DayPickerProps) => {
    const { t } = useTranslation()
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth())
    const [selected, setSelected] = useState<number | null>(null)

    const monthsFull = t('datepicker.months_full', { returnObjects: true }) as string[]
    const daysOfWeek = t('datepicker.days_of_week', { returnObjects: true }) as string[]

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    /**
     * Gets the previous month
     */
    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1) }
        else setMonth(m => m - 1)
    }

    /**
     * Gets the nest month
     */
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1) }
        else setMonth(m => m + 1)
    }

    /**
     * Returns que complete value of the date based on the day picked and the year and month the app tracked
     * @param d The dar picked
     */
    const select = (d: number) => {
        setSelected(d)
        onChange(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }

    const cells = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ]

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <button type="button"
                        className={`px-2 py-1 rounded ${PICKER_COLORS.nav}`}
                        onClick={prevMonth}>
                    ‹
                </button>
                <span className={`text-sm font-medium ${PICKER_COLORS.header}`}>
                    {monthsFull[month]} {year}
                </span>
                <button type="button"
                        className={`px-2 py-1 rounded ${PICKER_COLORS.nav}`}
                        onClick={nextMonth}>
                    ›
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(d => (
                    <div key={d} className={`h-9 w-9 flex items-center justify-center text-xs font-medium ${PICKER_COLORS.label}`}>
                        {d}
                    </div>
                ))}
                {cells.map((d, i) =>
                    d === null
                        ? <div key={`empty-${i}`} className={emptyCell} />
                        : <button
                            type="button"
                            key={d}
                            className={selected === d ? selectedCell : normalCell}
                            onClick={() => select(d)}
                        >
                            {d}
                        </button>
                )}
            </div>
        </div>
    )
}

export default DayPicker