import { useEffect, useState } from "react"
import api from "../api/axios"

export default function Dashboard() {
    const [activities, setActivities] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const load = async () => {
        try {
            setError(false)
            const [actsRes, dashRes] = await Promise.all([
                api.get("/activities/"),
                api.get("/dashboard/"),
            ])
            setActivities(Array.isArray(actsRes.data) ? actsRes.data : actsRes.data.results)
            setSummary(dashRes.data)
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    // C4 — estado de carga con skeleton
    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl animate-pulse">
                            <div className="h-3 bg-slate-700 rounded w-2/3 mb-2" />
                            <div className="h-7 bg-slate-800 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // C4 — estado de error con acción
    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-3">
                    <p className="font-bold">No se pudo cargar el dashboard</p>
                    <p className="text-sm opacity-80">Revisa tu conexión e inténtalo de nuevo.</p>
                    <button onClick={load}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white text-sm transition">
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>

            {/* C3 + C4 — Resumen con microcopy claro */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard label="Actividades" value={summary.total_activities}
                        sub={summary.total_activities === 0 ? "Crea tu primera actividad" : "en curso"} />
                    <SummaryCard label="Subtareas totales" value={summary.total_subtasks}
                        sub={summary.total_subtasks === 0 ? "Agrega subtareas a tus actividades" : "registradas"} />
                    <SummaryCard label="Horas pendientes" value={`${summary.pending_hours}h`}
                        sub="por completar" />
                    <SummaryCard label="Horas hoy" value={`${summary.today_hours}h`}
                        alert={summary.overload_today}
                        sub={summary.overload_today ? "⚠️ Sobrecarga detectada" : "programadas para hoy"} />
                </div>
            )}

            {/* C4 — Alerta de sobrecarga orientada a acción */}
            {summary?.overload_today && (
                <div className="bg-red-900/30 border border-red-500 p-4 rounded-xl text-red-300 text-sm flex justify-between items-center">
                    <p>Tienes más horas de las recomendadas hoy.</p>
                    <a href="/app/conflicts"
                        className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-white text-xs transition whitespace-nowrap ml-4">
                        Ver conflictos →
                    </a>
                </div>
            )}

            {/* C4 — Estado vacío con orientación */}
            {activities.length === 0 && (
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl text-center space-y-2">
                    <p className="font-bold text-white text-lg">Aún no tienes actividades</p>
                    <p className="text-sm text-slate-400">Crea tu primera actividad para empezar a planificar tu estudio.</p>
                    <a href="/app/activities"
                        className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition">
                        Crear actividad →
                    </a>
                </div>
            )}

            {/* C3 — Progreso consistente en cada actividad */}
            {activities.map(a => (
                <div key={a.id} className="bg-slate-900 p-5 rounded-xl space-y-3 border border-slate-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-white">{a.title}</p>
                            {a.due_date && (
                                <p className="text-xs text-slate-500 mt-0.5">Entrega: {a.due_date}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold ${a.progress === 100 ? "text-green-400" : "text-slate-400"}`}>
                                {a.progress}%
                            </p>
                            {/* C4 — microcopy de estado */}
                            <p className="text-xs text-slate-500">
                                {a.progress === 100 ? "Completada ✓" :
                                 a.progress === 0 ? "Sin iniciar" :
                                 "En progreso"}
                            </p>
                        </div>
                    </div>

                    {/* C3 — Barra de progreso consistente con Activities */}
                    <div className="w-full bg-slate-700 h-2.5 rounded-full">
                        <div
                            className={`h-2.5 rounded-full transition-all ${getBarColor(a)}`}
                            style={{ width: `${a.progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-xs text-slate-400">
                        <span>
                            {a.subtasks?.filter(s => s.completed).length || 0} de {a.subtasks?.length || 0} subtareas completadas
                        </span>
                        <div className="flex gap-2">
                            {isLate(a) && <span className="text-red-400 font-medium">Vencida</span>}
                            {!isLate(a) && isRisk(a) && <span className="text-yellow-400 font-medium">En riesgo</span>}
                            {isToday(a) && <span className="text-green-400 font-medium">Vence hoy</span>}
                            {a.progress === 100 && <span className="text-green-400 font-medium">Completada ✓</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

const today = new Date().toISOString().slice(0, 10)
function isLate(a) { return a.due_date && a.due_date < today && a.progress < 100 }
function isToday(a) { return a.due_date === today }
function isRisk(a) { return a.progress < 50 && !isLate(a) && !isToday(a) }
function getBarColor(a) {
    if (a.progress === 100) return "bg-green-500"
    if (isLate(a)) return "bg-red-500"
    if (isRisk(a)) return "bg-yellow-500"
    if (isToday(a)) return "bg-green-400"
    return "bg-indigo-500"
}

function SummaryCard({ label, value, alert, sub }) {
    return (
        <div className={`p-4 rounded-xl border ${alert ? "bg-red-900/20 border-red-700" : "bg-slate-900 border-slate-800"}`}>
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${alert ? "text-red-400" : "text-white"}`}>{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
    )
}