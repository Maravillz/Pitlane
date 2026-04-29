import {useState} from "react";
import {PICKER_COLORS} from "./PickerColors.ts";

const selectedCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-9 font-semibold ${PICKER_COLORS.selected}`
const normalCell = `flex items-center justify-center rounded-lg text-sm cursor-pointer select-none h-9 w-9 transition-colors ${PICKER_COLORS.normal}`

interface YearPickerProps {
    onChange: (value: string) => void
}

/**
 * Datepicker for only the year
 * @param onChange
 * @constructor
 */
const YearPicker = ({ onChange }: YearPickerProps) => {
    const now = new Date().getFullYear()
    const [rangeStart, setRangeStart] = useState(Math.floor(now / 12) * 12)
    const [selected, setSelected] = useState<number | null>(null)

    const years = Array.from({ length: 12 }, (_, i) => rangeStart + i)

    /**
     * Returns que complete value of the date based on the year picked
     * @param y The year picked
     */
    const select = (y: number) => {
        setSelected(y)
        onChange(`${y}`)
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <button type="button"
                        className={`px-2 py-1 rounded ${PICKER_COLORS.nav}`}
                        onClick={() => setRangeStart(r => r - 12)}>
                    ‹
                </button>
                <span className={`text-sm font-medium ${PICKER_COLORS.header}`}>
                    {rangeStart}–{rangeStart + 11}
                </span>
                <button type="button"
                        className={`px-2 py-1 rounded ${PICKER_COLORS.nav}`}
                        onClick={() => setRangeStart(r => r + 12)}>
                    ›
                </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {years.map(y => (
                    <button
                        type="button"
                        key={y}
                        className={selected === y ? selectedCell : normalCell}
                        onClick={() => select(y)}
                    >
                        {y}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default YearPicker