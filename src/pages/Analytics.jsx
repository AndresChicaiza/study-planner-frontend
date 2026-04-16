import { useEffect, useState } from "react"
import api from "../api/axios"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie
} from "recharts"

export default function Analytics() {

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  // ✅ LOAD ANALYTICS PRO
  useEffect(() => {

    const loadAnalytics = async () => {
      try {

        const actsRes = await api.get("/activities/")
        const subsRes = await api.get("/subtasks/")

        const activities = Array.isArray(actsRes.data)
          ? actsRes.data
          : actsRes.data.results

        const subtasks = subsRes.data

        const totalSubtasks = subtasks.length
        const completed = subtasks.filter(s => s.completed).length

        const totalHours = subtasks.reduce(
          (acc, s) => acc + Number(s.estimated_hours),
          0
        )

        const doneHours = subtasks
          .filter(s => s.completed)
          .reduce(
            (acc, s) => acc + Number(s.estimated_hours),
            0
          )

        const progress =
          totalSubtasks === 0
            ? 0
            : Math.round((completed / totalSubtasks) * 100)

        // ✅ ACTIVIDADES MÁS PESADAS
        const heavy = activities
          .map(a => {
            const mySubs = subtasks.filter(
              s => s.activity === a.id
            )

            const hours = mySubs.reduce(
              (acc, s) => acc + Number(s.estimated_hours),
              0
            )

            return {
              name: a.title,
              hours
            }
          })
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 5)

        setStats({
          totalSubtasks,
          completed,
          totalHours,
          doneHours,
          progress,
          heavy
        })

      } catch (err) {
        console.log(err)
      }

      setLoading(false)
    }

    loadAnalytics()

  }, [])

  // ✅ LOADING STATE
  if (loading || !stats) {
    return (
      <p className="text-white">
        Analizando productividad...
      </p>
    )
  }

  // ✅ PIE DATA
  const pieData = [
    { name: "Completadas", value: stats.completed },
    {
      name: "Pendientes",
      value: stats.totalSubtasks - stats.completed
    }
  ]

  // ✅ RIESGO LIMPIO
  let risk = "Buen progreso"

  if (stats.progress < 30) {
    risk = "Alto riesgo académico"
  } else if (stats.progress < 60) {
    risk = "Riesgo medio"
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold text-white">
        Analisis
      </h1>

      {/* ✅ CARDS */}
      <div className="grid grid-cols-4 gap-4">

        <Card title="Progreso">
          {stats.progress}%
        </Card>

        <Card title="Horas completadas">
          {stats.doneHours}h
        </Card>

        <Card title="Horas totales">
          {stats.totalHours}h
        </Card>

        <Card title="Riesgo">
          {risk}
        </Card>

      </div>

      {/* ✅ PIE */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">

        <h2 className="font-bold mb-4">
          Estado de subtareas
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              fill="#22c55e"
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

      </div>

      {/* ✅ BAR */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">

        <h2 className="font-bold mb-4">
          Actividades más pesadas
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.heavy}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}

// ✅ CARD LOCAL PRO
function Card({ title, children }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-xs opacity-60">
        {title}
      </p>
      <p className="text-2xl font-bold">
        {children}
      </p>
    </div>
  )
}
