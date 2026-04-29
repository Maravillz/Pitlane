import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PICKER_COLORS } from './PickerColors'

const selectedCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-9 font-semibold ${PICKER_COLORS.selected}`
const normalCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-9 transition-colors ${PICKER_COLORS.normal}`
const emptyCell = "h-9 w-9"

interface HourPickerProps {
    onChange: (value: string) => void
    onConfirm: () => void
}

/**
 * Datepicker with hour
 * @param onChange Function triggered when the date changes
 * @param onConfirm Function triggered when the value is confirmed
 * @constructor
 */
const HourPicker = ({ onChange, onConfirm }: HourPickerProps) => {
    const { t } = useTranslation()
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth())
    const [day, setDay] = useState<number | null>(null)
    const [hour, setHour] = useState(now.getHours())
    const [minute, setMinute] = useState(0)
    const [view, setView] = useState<'calendar' | 'time'>('calendar')

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
     * Returns que complete value of the date based on the day and hour picked and the year and month the app tracked
     * @param h The Hour picked
     * @param m The Minute picked
     */
    const select = (h: number, m: number) => {
        if (!day) return
        onChange(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }

    /**
     * Sets the day
     * @param d The day picked
     */
    const selectDay = (d: number) => {
        setDay(d)
        setView('time')
        select(hour, minute)
    }

    /**
     * Sets the hour
     * @param h The hour picked
     */
    const setH = (h: number) => { setHour(h); select(h, minute) }

    /**
     * Sets the minute
     * @param m The minute picked
     */
    const setM = (m: number) => { setMinute(m); select(hour, m) }

    const cells = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ]

    return (
        <div className="flex flex-col gap-3">
            {view === 'calendar' ? (
                <>
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
                                    className={day === d ? selectedCell : normalCell}
                                    onClick={() => selectDay(d)}
                                >
                                    {d}
                                </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <button type="button"
                                className={`text-sm px-2 py-1 rounded ${PICKER_COLORS.nav}`}
                                onClick={() => setView('calendar')}>
                            {t('datepicker.back')}
                        </button>
                        <span className={`text-sm font-medium ${PICKER_COLORS.header}`}>
                            {String(day).padStart(2, '0')}/{String(month + 1).padStart(2, '0')}/{year}
                        </span>
                        <div className="w-16" />
                    </div>
                    <div className="flex gap-4 items-center justify-center mt-2">
                        <div className="flex flex-col items-center gap-2">
                            <button type="button"
                                    className={`text-lg rounded px-3 py-1 ${PICKER_COLORS.nav}`}
                                    onClick={() => setH((hour + 1) % 24)}>
                                ▲
                            </button>
                            <span className={`text-3xl font-bold w-14 text-center ${PICKER_COLORS.header}`}>
                                {String(hour).padStart(2, '0')}
                            </span>
                            <button type="button"
                                    className={`text-lg rounded px-3 py-1 ${PICKER_COLORS.nav}`}
                                    onClick={() => setH((hour - 1 + 24) % 24)}>
                                ▼
                            </button>
                            <span className={`text-xs ${PICKER_COLORS.label}`}>{t('datepicker.hour')}</span>
                        </div>
                        <span className={`text-3xl font-bold mb-4 ${PICKER_COLORS.nav}`}>:</span>
                        <div className="flex flex-col items-center gap-2">
                            <button type="button"
                                    className={`text-lg rounded px-3 py-1 ${PICKER_COLORS.nav}`}
                                    onClick={() => setM((minute + 5) % 60)}>
                                ▲
                            </button>
                            <span className={`text-3xl font-bold w-14 text-center ${PICKER_COLORS.header}`}>
                                {String(minute).padStart(2, '0')}
                            </span>
                            <button type="button"
                                    className={`text-lg rounded px-3 py-1 ${PICKER_COLORS.nav}`}
                                    onClick={() => setM((minute - 5 + 60) % 60)}>
                                ▼
                            </button>
                            <span className={`text-xs ${PICKER_COLORS.label}`}>{t('datepicker.minute')}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={`mt-2 w-full rounded-lg py-2 font-semibold text-sm ${PICKER_COLORS.confirm}`}
                        onClick={onConfirm}>
                        {t('datepicker.confirm')}
                    </button>
                </>
            )}
        </div>
    )
}

export default HourPicker