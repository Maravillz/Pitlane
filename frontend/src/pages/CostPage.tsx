import type {CostPeriod, CostsSummary} from "../models/costs.ts";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {costsService} from "../services/costsService.ts";

/**
 * Reporting page for maintenance costs
 * @constructor
 */
const CostPage = () => {
    const { t } = useTranslation()
    const [period, setPeriod] = useState<CostPeriod>('year')
    const [costs, setCosts] = useState<CostsSummary | null>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {

        costsService.getCosts(period)
            .then(setCosts)
            .finally(() => setLoading(false))
    }, [period])

    const periodLabel = () => {
        const now = new Date()
        switch (period) {
            case 'month': return `${now.toLocaleString('pt', { month: 'long' })} ${now.getFullYear()}`
            case 'year': return `${now.getFullYear()}`
            case 'total': return t('costs.allTime')
        }
    }

    if (loading) return <p className="text-[#888] text-center mt-10">...</p>
    if (!costs) return null

    const maxCategory = Math.max(...costs.byCategory.map(c => c.totalCents))

    return (
        <div className="flex flex-col gap-6 px-3">

            <div className="flex flex-row bg-[#1a1a1a] rounded-xl p-1">
                {(['month', 'year', 'total'] as CostPeriod[]).map(p => (
                    <button
                        key={p}
                        className={`flex-1 py-2 rounded-lg text-sm transition-colors ${period === p ? 'bg-[#f5a623] text-[#1a1a1a] font-semibold' : 'text-[#888]'}`}
                        onClick={() => setPeriod(p)}
                    >
                        {t(`costs.${p}`)}
                    </button>
                ))}
            </div>

            <div className="text-center">
                <span className="text-[#f5a623] text-4xl font-bold">
                    {(costs.totalCents / 100).toFixed(2)}€
                </span>
                <p className="text-[#888] text-sm mt-1">{t('costs.totalSpent')} {periodLabel()}</p>
            </div>

            {/* By category */}
            <div className="flex flex-col gap-1">
                <p className="text-[#888] text-sm">{t('costs.byCategory')}</p>
                <div className="flex flex-col gap-3">
                    {costs.byCategory.map(cat => (
                        <div key={cat.category} className="flex flex-row items-center gap-3">
                            <span className="text-[#ccc] text-sm w-20 shrink-0">{t(`maintenanceTypes.${cat.category}`)}</span>
                            <div className="flex-1 bg-[#1a1a1a] rounded-full h-3">
                                <div
                                    className="h-3 rounded-full bg-[#f5a623]"
                                    style={{ width: `${(cat.totalCents / maxCategory) * 100}%` }}
                                />
                            </div>
                            <span className="text-[#888] text-sm w-16 text-right shrink-0">
                                {(cat.totalCents / 100).toFixed(2)}€
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* By vehicle */}
            <div className="flex flex-col gap-1">
                <p className="text-[#888] text-sm">{t('costs.byVehicle')}</p>
                <div className="flex flex-col gap-2">
                    {costs.byVehicle.map(v => (
                        <div key={v.vehicleId} className="flex flex-row justify-between items-center bg-[#1a1a1a] rounded-xl p-4">
                            <div className="flex flex-col">
                                <span className="text-[#ccc] text-sm">{v.vehicleName}</span>
                                <span className="text-[#f5a623] text-sm">{(v.totalCents / 100).toFixed(2)}€</span>
                            </div>
                            <span className="text-[#888] text-lg font-semibold">{v.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CostPage