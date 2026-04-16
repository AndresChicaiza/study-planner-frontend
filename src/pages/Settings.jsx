import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function Settings() {
    const [limit, setLimit] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/users/settings/")
                setLimit(res.data.daily_hours_limit)
            } catch {
                toast.error("Error cargando configuración")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const saveSettings = async () => {
        if (!limit || limit < 1 || limit > 24) {
            toast.error("El límite debe estar entre 1 y 24 horas")
            return
        }

        setSaving(true)
        await toast.promise(
            api.patch("/users/settings/update/", {
                daily_hours_limit: parseInt(limit)
            }),
            {
                loading: "Guardando...",
                success: "Límite actualizado",
                error: "Error al guardar",
            }
        )
        setSaving(false)
    }

    if (loading) return <p className="text-white">Cargando configuración...</p>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Configuración</h1>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 max-w-lg">

                {/* Límite diario */}
                <div className="space-y-3">
                    <div>
                        <p className="text-white font-medium">Límite diario de horas</p>
                        <p className="text-slate-400 text-sm mt-1">
                            Cuántas horas máximo quieres trabajar por día. Se usa para detectar
                            sobrecarga en la vista de Hoy.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            max="24"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 w-24 text-center text-lg font-bold"
                        />
                        <span className="text-slate-400">horas por día</span>
                    </div>

                    {/* Barra visual del límite */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>1h</span>
                            <span>12h</span>
                            <span>24h</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full">
                            <div
                                className="h-2 rounded-full bg-indigo-500 transition-all"
                                style={{ width: `${Math.min((limit / 24) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            {limit <= 6 && "Carga ligera — ideal para días con otras actividades"}
                            {limit > 6 && limit <= 10 && "Carga moderada — ritmo de trabajo normal"}
                            {limit > 10 && limit <= 16 && "Carga alta — asegúrate de tomar descansos"}
                            {limit > 16 && "Carga muy alta — recuerda descansar"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                    Guardar cambios
                </button>
            </div>
        </div>
    )
}