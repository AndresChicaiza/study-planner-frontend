import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function Conflicts() {
    const [conflicts, setConflicts] = useState([])
    const [loading, setLoading] = useState(true)
    const [redistributing, setRedistributing] = useState(null)

    const loadConflicts = async () => {
        try {
            const res = await api.get("/conflicts/")
            setConflicts(Array.isArray(res.data) ? res.data : [])
        } catch {
            toast.error("Error cargando conflictos")
            setConflicts([])
        } finally {
            setLoading(false)
        }
    }

    const resolveConflict = async (id) => {
        await toast.promise(
            api.patch(`/conflicts/${id}/resolve/`),
            {
                loading: "Resolviendo...",
                success: "Conflicto marcado como resuelto",
                error: "Error al resolver",
            }
        )
        loadConflicts()
    }

    // C4 Sprint 3 — Estrategia: redistribuir subtareas automáticamente
    const redistribute = async (id) => {
        setRedistributing(id)
        try {
            const res = await api.post(`/conflicts/${id}/redistribute/`)
            const { moved, hours_remaining_today } = res.data

            toast.success(
                `Se movieron ${moved.length} subtarea(s). Quedan ${hours_remaining_today}h hoy.`,
                { duration: 5000 }
            )
            loadConflicts()
        } catch {
            toast.error("Error al redistribuir")
        } finally {
            setRedistributing(null)
        }
    }

    useEffect(() => { loadConflicts() }, [])

    if (loading) return <p className="text-white">Analizando conflictos...</p>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Conflictos de carga</h1>

            {/* Explicación de la estrategia */}
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-sm text-slate-400 space-y-1">
                <p className="text-slate-300 font-medium">¿Cómo funciona la resolución?</p>
                <p>
                    Cuando un día tiene más horas de las configuradas en tu límite diario,
                    puedes redistribuir automáticamente las subtareas más pesadas a los días
                    siguientes hasta que el plan quede dentro del límite.
                </p>
            </div>

            {conflicts.length === 0 && (
                <div className="bg-green-900/30 border border-green-500 p-5 rounded-xl text-green-300">
                    ✔ No hay conflictos de sobrecarga. ¡Buen trabajo!
                </div>
            )}

            {conflicts.map((c) => (
                <div
                    key={c.id}
                    className="p-5 rounded-xl border border-red-500 bg-red-900/20 space-y-4"
                >
                    {/* Info del conflicto */}
                    <div>
                        <p className="font-bold text-red-300 text-lg">Sobrecarga detectada</p>
                        <p className="text-sm text-red-400 mt-1">Fecha: <span className="font-medium">{c.date}</span></p>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-red-400">
                                Total programado: <span className="font-bold">{c.hours}h</span>
                            </span>
                            <span className="text-slate-400">
                                Tu límite: <span className="font-bold">{c.limit}h</span>
                            </span>
                            <span className="text-orange-400">
                                Exceso: <span className="font-bold">+{c.excess}h</span>
                            </span>
                        </div>
                    </div>

                    {/* Estrategias */}
                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Estrategias disponibles</p>
                        <div className="flex gap-3 flex-wrap">

                            {/* Estrategia 1: Redistribuir automáticamente */}
                            <button
                                onClick={() => redistribute(c.id)}
                                disabled={redistributing === c.id}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition"
                            >
                                {redistributing === c.id ? "Redistribuyendo..." : "Redistribuir automáticamente"}
                            </button>

                            {/* Estrategia 2: Marcar como resuelto manualmente */}
                            <button
                                onClick={() => resolveConflict(c.id)}
                                className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-xl transition"
                            >
                                Marcar como resuelto
                            </button>

                        </div>
                        <p className="text-xs text-slate-500">
                            "Redistribuir" mueve las subtareas más pesadas al día siguiente hasta que las horas queden dentro de tu límite.
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}