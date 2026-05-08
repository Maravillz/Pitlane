import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    CheckCircleIcon,
    ClockIcon,
    WrenchScrewdriverIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

interface AlertDetail {
    id: string
    intervalKm: number | null
    intervalDays: number | null
    resolvedAt: string | null
    createdAt: string
}

interface PhotoDetail {
    id: string
    url: string
}

interface MaintenanceDetail {
    id: string
    type: string
    date: string
    mileage: number
    costCents: number | null
    notes: string | null
    createdAt: string
    photos: PhotoDetail[]
    alert: AlertDetail | null
}

const API_URL = import.meta.env.VITE_API_URL

const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
})

/**
 * Represents the maintenance detail page with photos, notes, alert, edit and delete
 */
const MaintenanceDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [maintenance, setMaintenance] = useState<MaintenanceDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Edit form state
    const [editForm, setEditForm] = useState({
        maintenanceType: '',
        date: '',
        mileage: 0,
        costCents: 0,
        notes: ''
    })
    const [newPhotos, setNewPhotos] = useState<File[]>([])
    const [saving, setSaving] = useState(false)
    const [editError, setEditError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) { navigate('/dashboard'); return }
        fetchDetail()
    }, [id])

    const fetchDetail = () => {
        fetch(`${API_URL}/api/maintenance/${id}`, { headers: authHeaders() })
            .then(res => { if (!res.ok) throw new Error(); return res.json() })
            .then((data: MaintenanceDetail) => {
                setMaintenance(data)
                setEditForm({
                    maintenanceType: data.type,
                    date: data.date,
                    mileage: data.mileage,
                    costCents: data.costCents ? data.costCents / 100 : 0,
                    notes: data.notes ?? ''
                })
            })
            .catch(() => navigate('/dashboard'))
            .finally(() => setLoading(false))
    }

    const handleSaveEdit = async () => {
        setSaving(true)
        setEditError(null)
        try {
            const formData = new FormData()
            formData.append('maintenance', new Blob([JSON.stringify({
                ...editForm,
                costCents: editForm.costCents ? Math.round(editForm.costCents * 100) : null
            })], { type: 'application/json' }))
            newPhotos.forEach(p => formData.append('photos', p))

            const res = await fetch(`${API_URL}/api/maintenance/${id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: formData
            })
            if (!res.ok) throw new Error()
            const updated = await res.json()
            setMaintenance(updated)
            setShowEditModal(false)
            setNewPhotos([])
        } catch {
            setEditError(t('updateVehicle.error'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await fetch(`${API_URL}/api/maintenance/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            })
            navigate(-1)
        } catch {
            setDeleting(false)
        }
    }

    const handleDeletePhoto = async (photoId: string) => {
        await fetch(`${API_URL}/api/maintenance/photo/${photoId}`, {
            method: 'DELETE',
            headers: authHeaders()
        })
        setMaintenance(prev => prev ? {
            ...prev,
            photos: prev.photos.filter(p => p.id !== photoId)
        } : prev)
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!maintenance) return null

    const inputClass = "bg-bg-input border border-border rounded-xl text-text-primary px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors w-full"

    return (
        <div className="flex flex-col gap-6 md:mx-10">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-text-primary text-xl font-bold">
                        {t(`maintenanceTypes.${maintenance.type}`)}
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        {maintenance.date} · {maintenance.mileage.toLocaleString()} km
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-card border border-border hover:border-brand text-text-secondary hover:text-brand transition-all"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-card border border-border hover:border-alert-critical text-text-secondary hover:text-alert-critical transition-all"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col bg-bg-card rounded-2xl p-4 border border-border">
                    <span className="text-xs text-text-muted mb-1">{t('carDetail.total')}</span>
                    <span className="text-lg font-bold text-brand">
                        {maintenance.costCents != null
                            ? `${(maintenance.costCents / 100).toFixed(2)}€`
                            : '—'}
                    </span>
                </div>
                <div className="flex flex-col bg-bg-card rounded-2xl p-4 border border-border">
                    <span className="text-xs text-text-muted mb-1">{t('carDetail.updated')}</span>
                    <span className="text-sm font-medium text-text-primary">
                        {new Date(maintenance.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Notes */}
            {maintenance.notes && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                        {t('createMaintenance.notes')}
                    </p>
                    <div className="bg-bg-card rounded-2xl p-4 border border-border">
                        <p className="text-text-secondary text-sm leading-relaxed">{maintenance.notes}</p>
                    </div>
                </div>
            )}

            {/* Photos */}
            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                    {t('createMaintenance.photos')}
                </p>
                {maintenance.photos?.length === 0 || maintenance.photos == null ? (
                    <div className="flex items-center gap-3 bg-bg-card rounded-2xl p-4 border border-border">
                        <span className="text-text-muted text-sm">Sem fotos adicionadas</span>
                    </div>
                ) : (
                    <div className="flex flex-row gap-3 flex-wrap">
                        {maintenance.photos.map(photo => (
                            <div key={photo.id} className="relative group">
                                <button
                                    onClick={() => setSelectedPhoto(photo.url)}
                                    className="w-24 h-24 rounded-xl overflow-hidden border border-border active:scale-95 transition-transform"
                                >
                                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                </button>
                                <button
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-bg-page/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <XMarkIcon className="w-3 h-3 text-alert-critical" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Alert */}
            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                    {t('carDetail.Alerts')}
                </p>
                {maintenance.alert ? (
                    <div className="flex items-center justify-between bg-bg-card rounded-2xl p-4 border border-border">
                        <div className="flex flex-col gap-1">
                            {maintenance.alert.intervalKm && (
                                <div className="flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="w-4 h-4 text-text-muted" />
                                    <span className="text-text-secondary text-sm">
                                        {t('carDetail.in')} {maintenance.alert.intervalKm.toLocaleString()} km
                                    </span>
                                </div>
                            )}
                            {maintenance.alert.intervalDays && (
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-text-muted" />
                                    <span className="text-text-secondary text-sm">
                                        {maintenance.alert.intervalDays} {t('createMaintenance.days')}
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            maintenance.alert.resolvedAt
                                ? 'bg-alert-none-bg text-alert-none'
                                : 'bg-alert-warning-bg text-alert-warning'
                        }`}>
                            {maintenance.alert.resolvedAt ? t('carDetail.resolved') : t('alertPage.actives')}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-bg-card rounded-2xl p-4 border border-border">
                        <CheckCircleIcon className="w-5 h-5 text-text-muted" />
                        <span className="text-text-secondary text-sm">Sem alerta configurado</span>
                    </div>
                )}
            </div>

            {/* ─── Edit Modal ──────────────────────────────────────────────────── */}
            {showEditModal && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex md:items-center justify-center items-center"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="bg-bg-card rounded-t-3xl md:rounded-3xl w-full md:max-w-sm p-6 flex flex-col gap-4 border border-border border-b-0 md:border-b mx-3"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-text-primary font-bold text-base">Editar manutenção</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-text-muted hover:text-text-primary w-8 h-8 flex items-center justify-center rounded-lg hover:bg-border transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-primary text-sm font-medium">{t('createMaintenance.date')}</label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={editForm.date}
                                    onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-primary text-sm font-medium">{t('createMaintenance.mileage')}</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={editForm.mileage}
                                    onChange={e => setEditForm(prev => ({ ...prev, mileage: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-text-primary text-sm font-medium">{t('createMaintenance.cost')} (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={editForm.costCents}
                                onChange={e => setEditForm(prev => ({ ...prev, costCents: Number(e.target.value) }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-text-primary text-sm font-medium">{t('createMaintenance.notes')}</label>
                            <textarea
                                className={`${inputClass} resize-none`}
                                rows={3}
                                value={editForm.notes}
                                onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>

                        {/* Add more photos */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-text-primary text-sm font-medium">{t('createMaintenance.photos')}</label>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {newPhotos.map((photo, i) => (
                                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                                        <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setNewPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-bg-page/90 rounded-full flex items-center justify-center"
                                        >
                                            <XMarkIcon className="w-2.5 h-2.5 text-alert-critical" />
                                        </button>
                                    </div>
                                ))}
                                {(maintenance.photos?.length ?? 0) + newPhotos.length < 3 && (
                                    <label className="w-16 h-16 rounded-xl bg-bg-input border border-dashed border-border-subtle flex items-center justify-center cursor-pointer hover:border-brand transition-colors">
                                        <PlusIcon className="w-5 h-5 text-text-muted" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={e => {
                                                if (e.target.files)
                                                    setNewPhotos(prev => [...prev, ...Array.from(e.target.files!)])
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {editError && (
                            <p className="text-alert-critical text-sm bg-alert-critical-bg px-4 py-2.5 rounded-xl">
                                {editError}
                            </p>
                        )}

                        <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="bg-brand hover:bg-brand/90 active:scale-[0.99] text-bg-card rounded-xl py-3.5 font-bold text-sm disabled:opacity-50 transition-all"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                                    {t('common.loading')}
                                </span>
                            ) : t('common.save')}
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirm Modal ─────────────────────────────────────────── */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="bg-bg-card rounded-t-3xl md:rounded-3xl w-full md:max-w-sm p-6 flex flex-col gap-4 border border-border border-b-0 md:border-b mx-3"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-2">
                            <h3 className="text-text-primary font-bold text-base">Eliminar manutenção</h3>
                            <p className="text-text-secondary text-sm">

                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-border transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-3 rounded-xl bg-alert-critical text-white text-sm font-bold disabled:opacity-50 hover:opacity-90 active:scale-[0.99] transition-all"
                            >
                                {deleting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {t('common.loading')}
                                    </span>
                                ) : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo lightbox */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <img src={selectedPhoto} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
                    <button
                        className="absolute top-6 right-6 text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}

export default MaintenanceDetailPage
