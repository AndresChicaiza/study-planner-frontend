import { useEffect, useState } from "react"
import api from "../api/axios"
import TodaySection from "../components/TodaySection"

export default function Today() {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadToday = async () => {
    try {
      const res = await api.get("/today/")
      setData(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadToday()
    }
    init()
  }, [])

  if (loading) {
    return (
      <p className="text-white">
        Analizando planificación inteligente...
      </p>
    )
  }

  const totalHoy =
    (data?.vencidas?.reduce((acc, a) => acc + Number(a.hours), 0) || 0) +
    (data?.hoy?.reduce((acc, a) => acc + Number(a.hours), 0) || 0)

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-white">
        Plan Inteligente de Hoy
      </h1>

      {data?.overload && (
        <div className="bg-red-900/30 border border-red-500 p-5 rounded-xl text-red-300">
          ⚠️ Sobrecarga detectada hoy
        </div>
      )}

      <div className="bg-indigo-900/30 border border-indigo-500 p-5 rounded-xl text-indigo-300">
        <p className="text-sm opacity-70">Horas recomendadas hoy</p>
        <p className="text-4xl font-bold">{totalHoy}h</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">

        <TodaySection
          title="🔴 Vencidas"
          items={data?.vencidas}
          color="border-red-500 bg-red-900/20 text-red-300"
        />

        <TodaySection
          title="🟡 Hoy"
          items={data?.hoy}
          color="border-yellow-500 bg-yellow-900/20 text-yellow-300"
        />

        <TodaySection
          title="🔵 Próximas"
          items={data?.proximas}
          color="border-indigo-500 bg-indigo-900/20 text-indigo-300"
        />

      </div>

    </div>
  )
}