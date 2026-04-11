import { useEffect, useState } from "react"
import api from "../api/axios"

export default function Dashboard() {
    const [activities, setActivities] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                // Una sola llamada al endpoint dedicado del backend
                const [actsRes, dashRes] = await Promise.all([
                    api.get("/activities/"),
                    api.get("/dashboard/"),
                ])

                const acts = Array.isArray(actsRes.data)
                    ? actsRes.data
                    : actsRes.data.results

                setActivities(acts)
                setSummary(dashRes.data)
            } catch {
                setError("Error cargando el dashboard")
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    if (loading) return <p className="text-white">Cargando dashboard...</p>

    if (error) return (
        <p className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-xl text-sm">
            {error}
        </p>
    )

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>

            {/* RESUMEN GENERAL */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard label="Actividades" value={summary.total_activities} />
                    <SummaryCard label="Subtareas" value={summary.total_subtasks} />
                    <SummaryCard label="Horas pendientes" value={`${summary.pending_hours}h`} />
                    <SummaryCard
                        label="Horas hoy"
                        value={`${summary.today_hours}h`}
                        alert={summary.overload_today}
                    />
                </div>
            )}

            {summary?.overload_today && (
                <div className="bg-red-900/30 border border-red-500 p-4 rounded-xl text-red-300 text-sm">
                    ⚠️ Tienes sobrecarga de horas hoy. Considera redistribuir algunas subtareas.
                </div>
            )}

            {/* LISTA DE ACTIVIDADES */}
            {activities.length === 0 && (
                <p className="text-slate-400 text-sm">No tienes actividades aún. Ve a Actividades para crear una.</p>
            )}

            {activities.map(a => {
                const barColor = getBarColor(a)

                return (
                    <div
                        key={a.id}
                        className="bg-slate-900 p-5 rounded-xl space-y-3 border border-slate-800"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg text-white">{a.title}</p>
                                {a.due_date && (
                                    <p className="text-xs text-slate-500 mt-0.5">Entrega: {a.due_date}</p>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 font-medium">{a.progress}%</p>
                        </div>

                        <div className="w-full bg-slate-700 h-2.5 rounded-full">
                            <div
                                className={`h-2.5 rounded-full transition-all ${barColor}`}
                                style={{ width: `${a.progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-sm text-slate-400">
                            <p>{a.subtasks?.length || 0} subtareas</p>
                            <div className="flex gap-2">
                                {isLate(a) && (
                                    <span className="text-red-400 font-semibold">Vencida</span>
                                )}
                                {!isLate(a) && isRisk(a) && (
                                    <span className="text-yellow-400 font-semibold">En riesgo</span>
                                )}
                                {isToday(a) && (
                                    <span className="text-green-400 font-semibold">Vence hoy</span>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ================= HELPERS =================

const today = new Date().toISOString().slice(0, 10)

function isLate(a) {
    return a.due_date && a.due_date < today && a.progress < 100
}

function isToday(a) {
    return a.due_date === today
}

function isRisk(a) {
    return a.progress < 50 && !isLate(a) && !isToday(a)
}

function getBarColor(a) {
    if (isLate(a)) return "bg-red-500"
    if (isRisk(a)) return "bg-yellow-500"
    if (isToday(a)) return "bg-green-500"
    return "bg-indigo-500"
}

// ================= SUMMARY CARD =================

function SummaryCard({ label, value, alert }) {
    return (
        <div className={`p-4 rounded-xl border ${alert
            ? "bg-red-900/20 border-red-700"
            : "bg-slate-900 border-slate-800"
        }`}>
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${alert ? "text-red-400" : "text-white"}`}>
                {value}
            </p>
        </div>
    )
}