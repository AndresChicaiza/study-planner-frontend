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

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white text-center">Plan de Hoy</h1>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white text-center">Plan de Hoy</h1>
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-3" role="alert">
                    <p className="font-bold">No se pudo cargar tu plan</p>
                    <p className="text-sm">Revisa tu conexión e inténtalo de nuevo.</p>
                    <button
                        onClick={loadToday}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white text-sm transition focus:outline-none focus:ring-2 focus:ring-red-400"
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
            <h1 className="text-3xl font-bold text-white text-center">Plan de Hoy</h1>

            {/* Regla visible — texto más grande y mejor contraste (WCAG AA) */}
            <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl space-y-3">
                <p className="text-base font-semibold text-slate-200">¿Cómo se organiza tu plan?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-start gap-2">
                        <span className="text-red-400 font-bold mt-0.5 text-lg" aria-hidden="true">●</span>
                        <span className="text-sm text-slate-200">
                            <span className="text-red-400 font-semibold">Vencidas</span> — fecha anterior a hoy, pendientes. Puedes reprogramarlas.
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-300 font-bold mt-0.5 text-lg" aria-hidden="true">●</span>
                        <span className="text-sm text-slate-200">
                            <span className="text-yellow-300 font-semibold">Hoy</span> — programadas para hoy, pendientes o pospuestas
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold mt-0.5 text-lg" aria-hidden="true">●</span>
                        <span className="text-sm text-slate-200">
                            <span className="text-indigo-400 font-semibold">Próximas</span> — fechas futuras, pendientes
                        </span>
                    </div>
                </div>
                <p className="text-sm text-slate-300">
                    Las subtareas completadas no aparecen aquí. Sobrecarga cuando las horas del día superan tu límite ({data?.daily_limit || 6}h).{" "}
                    <a href="/app/settings" className="text-indigo-400 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded">
                        Cambiar límite →
                    </a>
                </p>
            </div>

            {/* Alerta de sobrecarga */}
            {data?.overload && (
                <div
                    className="bg-red-900/30 border border-red-400 p-5 rounded-xl text-red-200 space-y-2"
                    role="alert"
                    aria-live="polite"
                >
                    <p className="font-bold text-base">⚠️ Sobrecarga detectada hoy</p>
                    <p className="text-sm">
                        Tienes <strong>{totalHoy}h</strong> programadas y tu límite es <strong>{data?.daily_limit || 6}h</strong>.
                        Ve a{" "}
                        <a href="/app/conflicts" className="underline hover:text-red-100 focus:outline-none focus:ring-1 focus:ring-red-300 rounded">
                            Conflictos
                        </a>{" "}
                        para redistribuir automáticamente.
                    </p>
                </div>
            )}

            {/* Resumen horas */}
            <div className="bg-indigo-900/30 border border-indigo-400 p-5 rounded-xl text-indigo-200">
                <p className="text-sm font-medium">Horas pendientes hoy</p>
                <p className="text-4xl font-bold">{totalHoy}h</p>
            </div>

            {/* Estado vacío */}
            {!haySubtareas && (
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl text-center space-y-2">
                    <p className="font-bold text-white text-lg">¡Sin pendientes por ahora!</p>
                    <p className="text-sm text-slate-300">
                        No tienes subtareas pendientes para hoy ni días anteriores.
                    </p>
                    <a
                        href="/app/activities"
                        className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Ir a Actividades →
                    </a>
                </div>
            )}

            {/* Secciones */}
            {haySubtareas && (
                <div className="grid md:grid-cols-3 gap-5">
                    {/* Vencidas con reprogramar */}
                    <div className="p-5 rounded-xl border border-red-400 bg-red-900/20" role="region" aria-label="Tareas vencidas">
                        <h2 className="font-bold text-lg mb-3 text-red-200">
                            🔴 Vencidas
                            <span className="ml-2 text-sm font-normal opacity-70">({data?.vencidas?.length || 0})</span>
                        </h2>
                        {!data?.vencidas?.length ? (
                            <p className="text-sm text-red-300 opacity-70 italic">Sin tareas vencidas ✓</p>
                        ) : (
                            <div className="space-y-3">
                                {data.vencidas.map(s => (
                                    <div key={s.id} className="bg-slate-900 p-3 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-bold text-white">{s.title}</p>
                                                <p className="text-xs text-red-300">Vencía: {s.date}</p>
                                            </div>
                                            <span className="font-bold text-red-200">{s.hours}h</span>
                                        </div>
                                        {rescheduling[s.id] ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={newDate[s.id] || ""}
                                                    onChange={(e) => setNewDate({ ...newDate, [s.id]: e.target.value })}
                                                    aria-label="Nueva fecha para reprogramar"
                                                    className="bg-slate-700 text-white p-1.5 rounded-lg text-xs border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
                                                />
                                                <button
                                                    onClick={() => reschedule(s.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-lg text-white text-xs transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                    aria-label="Confirmar reprogramación"
                                                >
                                                    OK
                                                </button>
                                                <button
                                                    onClick={() => setRescheduling({ ...rescheduling, [s.id]: false })}
                                                    className="bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded-lg text-white text-xs transition focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    aria-label="Cancelar reprogramación"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setRescheduling({ ...rescheduling, [s.id]: true })}
                                                className="text-sm text-indigo-400 hover:text-indigo-300 transition focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
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
                        color="border-yellow-400 bg-yellow-900/20 text-yellow-200"
                        emptyMessage="Sin tareas para hoy ✓"
                        ariaLabel="Tareas de hoy"
                    />

                    <TodaySection
                        title="🔵 Próximas"
                        items={data?.proximas}
                        color="border-indigo-400 bg-indigo-900/20 text-indigo-200"
                        emptyMessage="Sin tareas próximas"
                        ariaLabel="Tareas próximas"
                    />
                </div>
            )}
        </div>
    )
}