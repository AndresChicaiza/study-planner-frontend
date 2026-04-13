import { useEffect, useState } from "react"
import api from "../api/axios"
import TodaySection from "../components/TodaySection"

export default function Today() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

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

    // Estado de carga
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

    // Estado de error
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

            {/* Regla visible — cómo funciona la clasificación */}
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2">
                <p className="text-sm font-medium text-slate-300">¿Cómo se organiza tu plan?</p>
                <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                        <span className="text-red-400 font-bold mt-0.5">●</span>
                        <span><span className="text-red-400 font-medium">Vencidas</span> — subtareas con fecha anterior a hoy sin completar</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold mt-0.5">●</span>
                        <span><span className="text-yellow-400 font-medium">Hoy</span> — subtareas programadas para el día de hoy</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold mt-0.5">●</span>
                        <span><span className="text-indigo-400 font-medium">Próximas</span> — subtareas pendientes para días futuros</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                    Se detecta sobrecarga cuando las horas del día superan tu límite diario ({data?.daily_limit || 6}h).
                </p>
            </div>

            {/* Alerta de sobrecarga */}
            {data?.overload && (
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-1">
                    <p className="font-bold">⚠️ Sobrecarga detectada</p>
                    <p className="text-sm opacity-80">
                        Tienes {totalHoy}h programadas hoy y tu límite es {data?.daily_limit || 6}h.
                        Considera mover algunas subtareas a días siguientes.
                    </p>
                </div>
            )}

            {/* Resumen de horas */}
            <div className="bg-indigo-900/30 border border-indigo-500 p-5 rounded-xl text-indigo-300">
                <p className="text-sm opacity-70">Horas pendientes hoy</p>
                <p className="text-4xl font-bold">{totalHoy}h</p>
            </div>

            {/* Estado vacío — no hay subtareas */}
            {!haySubtareas && (
                <div className="bg-green-900/30 border border-green-500 p-5 rounded-xl text-green-300 text-center">
                    <p className="font-bold text-lg">¡Todo al día!</p>
                    <p className="text-sm opacity-80 mt-1">
                        No tienes subtareas pendientes. Crea actividades y agrégales subtareas con fecha para verlas aquí.
                    </p>
                </div>
            )}

            {/* Secciones */}
            {haySubtareas && (
                <div className="grid md:grid-cols-3 gap-5">
                    <TodaySection
                        title="🔴 Vencidas"
                        items={data?.vencidas}
                        color="border-red-500 bg-red-900/20 text-red-300"
                        emptyMessage="Sin tareas vencidas"
                    />
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