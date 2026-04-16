import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"
import TodaySection from "../components/TodaySection"

export default function Today() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [rescheduling, setRescheduling] = useState({})
    const [newDate, setNewDate] = useState({})

    const loadToday = async () => {
        try {
            setError(false)
            const res = await api.get("/today/")
            setData(res.data)
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadToday() }, [])

    // C1 Sprint 3 — Reprogramar subtarea vencida
    const reschedule = async (subtaskId) => {
        const date = newDate[subtaskId]
        if (!date) return toast.error("Selecciona una nueva fecha")

        await toast.promise(
            api.patch(`/subtasks/${subtaskId}/reschedule/`, { target_date: date }),
            {
                loading: "Reprogramando...",
                success: "Subtarea reprogramada",
                error: "Error al reprogramar",
            }
        )
        setRescheduling({ ...rescheduling, [subtaskId]: false })
        setNewDate({ ...newDate, [subtaskId]: "" })
        loadToday()
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Plan de Hoy</h1>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <p className="text-slate-400 text-sm">Analizando tu planificación...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Plan de Hoy</h1>
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-3">
                    <p className="font-bold">No se pudo cargar tu plan de hoy</p>
                    <p className="text-sm opacity-80">Verifica tu conexión e intenta de nuevo.</p>
                    <button
                        onClick={loadToday}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white text-sm transition"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    const totalHoy =
        (data?.vencidas?.reduce((acc, a) => acc + Number(a.hours), 0) || 0) +
        (data?.hoy?.reduce((acc, a) => acc + Number(a.hours), 0) || 0)

    const haySubtareas =
        (data?.vencidas?.length || 0) +
        (data?.hoy?.length || 0) +
        (data?.proximas?.length || 0) > 0

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Plan de Hoy</h1>

            {/* Regla visible */}
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2">
                <p className="text-sm font-medium text-slate-300">¿Cómo se organiza tu plan?</p>
                <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                        <span className="text-red-400 font-bold mt-0.5">●</span>
                        <span><span className="text-red-400 font-medium">Vencidas</span> — fecha anterior a hoy, sin completar. Puedes reprogramarlas.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold mt-0.5">●</span>
                        <span><span className="text-yellow-400 font-medium">Hoy</span> — programadas para el día de hoy</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold mt-0.5">●</span>
                        <span><span className="text-indigo-400 font-medium">Próximas</span> — pendientes para días futuros</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                    Sobrecarga detectada cuando horas del día superan tu límite ({data?.daily_limit || 6}h).
                    Configúralo en <a href="/app/settings" className="text-indigo-400 hover:underline">Configuración</a>.
                </p>
            </div>

            {/* Alerta sobrecarga */}
            {data?.overload && (
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-1">
                    <p className="font-bold">⚠️ Sobrecarga detectada</p>
                    <p className="text-sm opacity-80">
                        Tienes {totalHoy}h programadas hoy y tu límite es {data?.daily_limit || 6}h.
                        Reprograma algunas tareas vencidas o reduce las de hoy.
                    </p>
                </div>
            )}

            {/* Resumen horas */}
            <div className="bg-indigo-900/30 border border-indigo-500 p-5 rounded-xl text-indigo-300">
                <p className="text-sm opacity-70">Horas pendientes hoy</p>
                <p className="text-4xl font-bold">{totalHoy}h</p>
            </div>

            {/* Estado vacío */}
            {!haySubtareas && (
                <div className="bg-green-900/30 border border-green-500 p-5 rounded-xl text-green-300 text-center">
                    <p className="font-bold text-lg">¡Todo al día!</p>
                    <p className="text-sm opacity-80 mt-1">
                        No tienes subtareas pendientes. Crea actividades y agrégales subtareas con fecha para verlas aquí.
                    </p>
                </div>
            )}

            {haySubtareas && (
                <div className="grid md:grid-cols-3 gap-5">

                    {/* Vencidas con botón de reprogramar */}
                    <div className={`p-5 rounded-xl border border-red-500 bg-red-900/20`}>
                        <h2 className="font-bold text-lg mb-3 text-red-300">
                            🔴 Vencidas
                            <span className="ml-2 text-sm font-normal opacity-60">
                                ({data?.vencidas?.length || 0})
                            </span>
                        </h2>

                        {!data?.vencidas?.length ? (
                            <p className="text-sm text-red-400 opacity-50 italic">Sin tareas vencidas</p>
                        ) : (
                            <div className="space-y-3">
                                {data.vencidas.map(s => (
                                    <div key={s.id} className="bg-slate-900 p-3 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-bold text-white">{s.title}</p>
                                                <p className="text-xs text-red-400">Vencía: {s.date}</p>
                                            </div>
                                            <span className="font-bold text-red-300">{s.hours}h</span>
                                        </div>

                                        {/* Botón reprogramar */}
                                        {rescheduling[s.id] ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={newDate[s.id] || ""}
                                                    onChange={(e) => setNewDate({ ...newDate, [s.id]: e.target.value })}
                                                    className="bg-slate-700 text-white p-1.5 rounded-lg text-xs border border-slate-600 focus:outline-none focus:border-indigo-500 flex-1"
                                                />
                                                <button
                                                    onClick={() => reschedule(s.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-lg text-white text-xs transition"
                                                >
                                                    OK
                                                </button>
                                                <button
                                                    onClick={() => setRescheduling({ ...rescheduling, [s.id]: false })}
                                                    className="bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded-lg text-white text-xs transition"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setRescheduling({ ...rescheduling, [s.id]: true })}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                                            >
                                                Reprogramar →
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <TodaySection
                        title="🟡 Hoy"
                        items={data?.hoy}
                        color="border-yellow-500 bg-yellow-900/20 text-yellow-300"
                        emptyMessage="Sin tareas para hoy"
                    />

                    <TodaySection
                        title="🔵 Próximas"
                        items={data?.proximas}
                        color="border-indigo-500 bg-indigo-900/20 text-indigo-300"
                        emptyMessage="Sin tareas próximas"
                    />
                </div>
            )}
        </div>
    )
}