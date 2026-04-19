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

    const reschedule = async (subtaskId) => {
        const date = newDate[subtaskId]
        if (!date) return toast.error("Selecciona una nueva fecha")

        await toast.promise(
            api.patch(`/subtasks/${subtaskId}/reschedule/`, { target_date: date }),
            { loading: "Reprogramando...", success: "Subtarea reprogramada", error: "Error al reprogramar" }
        )
        setRescheduling({ ...rescheduling, [subtaskId]: false })
        setNewDate({ ...newDate, [subtaskId]: "" })
        loadToday()
    }

    // C4 — estado de carga
    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Plan de Hoy</h1>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
            </div>
        )
    }

    // C4 — estado de error con acción clara
    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Plan de Hoy</h1>
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-3">
                    <p className="font-bold">No se pudo cargar tu plan</p>
                    <p className="text-sm opacity-80">Revisa tu conexión e inténtalo de nuevo.</p>
                    <button onClick={loadToday}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white text-sm transition">
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

            {/* C3 — Regla visible y consistente */}
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2">
                <p className="text-sm font-medium text-slate-300">¿Cómo se organiza tu plan?</p>
                <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                        <span className="text-red-400 font-bold mt-0.5">●</span>
                        <span><span className="text-red-400 font-medium">Vencidas</span> — fecha anterior a hoy, pendientes. Puedes reprogramarlas.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold mt-0.5">●</span>
                        <span><span className="text-yellow-400 font-medium">Hoy</span> — programadas para hoy, pendientes o pospuestas</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold mt-0.5">●</span>
                        <span><span className="text-indigo-400 font-medium">Próximas</span> — fechas futuras, pendientes</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                    Las subtareas completadas no aparecen aquí. Sobrecarga cuando horas del día superan tu límite ({data?.daily_limit || 6}h).{" "}
                    <a href="/app/settings" className="text-indigo-400 hover:underline">Cambiar límite →</a>
                </p>
            </div>

            {/* C3 + C4 — Alerta de sobrecarga con números claros */}
            {data?.overload && (
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-2">
                    <p className="font-bold">⚠️ Sobrecarga detectada hoy</p>
                    <p className="text-sm opacity-80">
                        Tienes <span className="font-bold">{totalHoy}h</span> programadas y tu límite es <span className="font-bold">{data?.daily_limit || 6}h</span>.
                        Ve a <a href="/app/conflicts" className="underline hover:text-red-200">Conflictos</a> para redistribuir automáticamente.
                    </p>
                </div>
            )}

            {/* Resumen horas */}
            <div className="bg-indigo-900/30 border border-indigo-500 p-5 rounded-xl text-indigo-300">
                <p className="text-sm opacity-70">Horas pendientes hoy</p>
                <p className="text-4xl font-bold">{totalHoy}h</p>
                {/* C3 — Consistencia: progreso global */}
                {data?.total_completed !== undefined && (
                    <p className="text-xs opacity-60 mt-1">
                        {data.total_completed} subtarea(s) completadas en total hoy
                    </p>
                )}
            </div>

            {/* C4 — Estado vacío orientado a acción */}
            {!haySubtareas && (
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl text-center space-y-2">
                    <p className="font-bold text-white text-lg">¡Sin pendientes por ahora!</p>
                    <p className="text-sm text-slate-400">
                        No tienes subtareas pendientes para hoy ni días anteriores.
                    </p>
                    <a href="/app/activities"
                        className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition">
                        Ir a Actividades →
                    </a>
                </div>
            )}

            {/* Secciones */}
            {haySubtareas && (
                <div className="grid md:grid-cols-3 gap-5">

                    {/* Vencidas con reprogramar */}
                    <div className="p-5 rounded-xl border border-red-500 bg-red-900/20">
                        <h2 className="font-bold text-lg mb-3 text-red-300">
                            🔴 Vencidas
                            <span className="ml-2 text-sm font-normal opacity-60">({data?.vencidas?.length || 0})</span>
                        </h2>
                        {!data?.vencidas?.length ? (
                            <p className="text-sm text-red-400 opacity-50 italic">Sin tareas vencidas ✓</p>
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
                                        {rescheduling[s.id] ? (
                                            <div className="flex gap-2">
                                                <input type="date" value={newDate[s.id] || ""}
                                                    onChange={(e) => setNewDate({ ...newDate, [s.id]: e.target.value })}
                                                    className="bg-slate-700 text-white p-1.5 rounded-lg text-xs border border-slate-600 focus:outline-none focus:border-indigo-500 flex-1" />
                                                <button onClick={() => reschedule(s.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-lg text-white text-xs transition">OK</button>
                                                <button onClick={() => setRescheduling({ ...rescheduling, [s.id]: false })}
                                                    className="bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded-lg text-white text-xs transition">✕</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setRescheduling({ ...rescheduling, [s.id]: true })}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 transition">
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
                        emptyMessage="Sin tareas para hoy ✓"
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