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
        <div className="flex flex-col gap-6">

            {/* Period selector */}
            <div className="flex bg-bg-card rounded-2xl p-1 border border-border">
                {(['month', 'year', 'total'] as CostPeriod[]).map(p => (
                    <button
                        key={p}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${period === p
                            ? 'bg-brand text-bg-card shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                        onClick={() => setPeriod(p)}
                    >
                        {t(`costs.${p}`)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : !costs ? null : (
                <>
                    {/* Total */}
                    <div className="text-center py-2">
                        <span className="text-brand font-black text-5xl tracking-tight">
                            {(costs.totalCents / 100).toFixed(2)}€
                        </span>
                        <p className="text-text-secondary text-sm mt-2">
                            {t('costs.totalSpent')} {periodLabel()}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* By category */}
                        <div>
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
                                {t('costs.byCategory')}
                            </p>
                            <div className="flex flex-col gap-4">
                                {costs.byCategory.map(cat => (
                                    <div key={cat.category}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-text-primary text-sm font-medium">
                                                {t(`maintenanceTypes.${cat.category}`)}
                                            </span>
                                            <span className="text-text-secondary text-sm">
                                                {(cat.totalCents / 100).toFixed(2)}€
                                            </span>
                                        </div>
                                        <div className="h-2 bg-border rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand rounded-full transition-all duration-500"
                                                style={{ width: `${(cat.totalCents / maxCategory) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* By vehicle */}
                        <div>
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                                {t('costs.byVehicle')}
                            </p>
                            <div className="flex flex-col gap-2">
                                {costs.byVehicle.map(v => (
                                    <div
                                        key={v.vehicleId}
                                        className="flex items-center justify-between bg-bg-card rounded-2xl px-4 py-4 border border-border"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-text-primary text-sm font-medium">{v.vehicleName}</span>
                                            <span className="text-brand text-sm font-semibold mt-0.5">
                                                {(v.totalCents / 100).toFixed(2)}€
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-border rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand rounded-full"
                                                    style={{ width: `${v.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-text-secondary text-sm font-semibold w-10 text-right">
                                                {v.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default CostPage