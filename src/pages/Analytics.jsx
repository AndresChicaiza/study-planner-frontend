import { useEffect, useState } from "react"
import api from "../api/axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

export default function Analytics() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [stats, setStats] = useState(null)

    const load = async () => {
        try {
            setError(false)
            const [actsRes, subsRes] = await Promise.all([
                api.get("/activities/"),
                api.get("/subtasks/"),
            ])

            const activities = Array.isArray(actsRes.data) ? actsRes.data : actsRes.data.results
            const subtasks = subsRes.data

            const totalSubtasks = subtasks.length
            const completed = subtasks.filter(s => s.completed).length
            const postponed = subtasks.filter(s => s.status === "postponed").length
            const pending = subtasks.filter(s => !s.completed && s.status !== "postponed").length

            const totalHours = subtasks.reduce((acc, s) => acc + Number(s.estimated_hours), 0)
            const doneHours = subtasks.filter(s => s.completed).reduce((acc, s) => acc + Number(s.real_hours || s.estimated_hours), 0)
            const progress = totalSubtasks === 0 ? 0 : Math.round((completed / totalSubtasks) * 100)

            const heavy = activities
                .map(a => ({
                    name: a.title.length > 15 ? a.title.slice(0, 15) + "…" : a.title,
                    horas: parseFloat(subtasks.filter(s => s.activity === a.id).reduce((acc, s) => acc + Number(s.estimated_hours), 0).toFixed(1)),
                    progreso: a.progress,
                }))
                .sort((a, b) => b.horas - a.horas)
                .slice(0, 5)

            setStats({ totalSubtasks, completed, postponed, pending, totalHours, doneHours, progress, heavy })
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    // C4 — estado de carga
    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="text-slate-400 text-sm animate-pulse">Calculando tu productividad...</p>
            </div>
        )
    }

    // C4 — estado de error
    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300 space-y-3">
                    <p className="font-bold">No se pudieron cargar los datos</p>
                    <button onClick={load} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white text-sm transition">
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    // C4 — estado vacío
    if (stats.totalSubtasks === 0) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl text-center space-y-2">
                    <p className="font-bold text-white text-lg">Aún no hay datos que analizar</p>
                    <p className="text-sm text-slate-400">Crea actividades y subtareas para ver tu progreso aquí.</p>
                    <a href="/app/activities"
                        className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition">
                        Ir a Actividades →
                    </a>
                </div>
            </div>
        )
    }

    // C4 — microcopy de riesgo claro y orientado a acción
    const riskLabel = stats.progress < 30 ? "Alto riesgo" : stats.progress < 60 ? "Riesgo medio" : "Buen progreso"
    const riskColor = stats.progress < 30 ? "text-red-400" : stats.progress < 60 ? "text-yellow-400" : "text-green-400"

    const pieData = [
        { name: "Completadas", value: stats.completed },
        { name: "Pendientes", value: stats.pending },
        { name: "Pospuestas", value: stats.postponed },
    ].filter(d => d.value > 0)

    const PIE_COLORS = ["#22c55e", "#6366f1", "#eab308"]

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Analytics</h1>

            {/* C3 + C4 — Cards con microcopy orientado */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Progreso global" value={`${stats.progress}%`} sub={riskLabel} subColor={riskColor} />
                <StatCard label="Horas completadas" value={`${stats.doneHours.toFixed(1)}h`} sub={`de ${stats.totalHours.toFixed(1)}h totales`} />
                <StatCard label="Subtareas" value={`${stats.completed}/${stats.totalSubtasks}`} sub="completadas" />
                <StatCard label="Pospuestas" value={stats.postponed}
                    sub={stats.postponed > 0 ? "Revisa tus pendientes" : "Sin tareas pospuestas"}
                    subColor={stats.postponed > 0 ? "text-yellow-400" : "text-slate-500"} />
            </div>

            {/* PIE — C3 ahora incluye pospuestas */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="font-bold mb-1 text-white">Estado de subtareas</h2>
                <p className="text-xs text-slate-500 mb-4">Distribución por estado actual</p>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* BAR — C3 muestra progreso por actividad */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="font-bold mb-1 text-white">Carga por actividad</h2>
                <p className="text-xs text-slate-500 mb-4">Top 5 actividades con más horas estimadas</p>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.heavy}>
                        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                            labelStyle={{ color: "#f1f5f9" }}
                        />
                        <Bar dataKey="horas" fill="#6366f1" radius={[4, 4, 0, 0]} name="Horas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function StatCard({ label, value, sub, subColor = "text-slate-500" }) {
    return (
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {sub && <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>}
        </div>
    )
}