import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function Conflicts() {
    const [conflicts, setConflicts] = useState([])
    const [loading, setLoading] = useState(true)

    const loadConflicts = async () => {
        try {
            const res = await api.get("/conflicts/")
            setConflicts(Array.isArray(res.data) ? res.data : [])
        } catch {
            toast.error("Error cargando conflictos")
            setConflicts([])
        } finally {
            setLoading(false)
        }
    }

    const resolveConflict = async (id) => {
        await toast.promise(
            api.patch(`/conflicts/${id}/resolve/`),
            {
                loading: "Resolviendo...",
                success: "Conflicto resuelto",
                error: "Error al resolver",
            }
        )
        loadConflicts()
    }

    useEffect(() => { loadConflicts() }, [])

    if (loading) return <p className="text-white">Analizando conflictos...</p>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Conflictos de carga</h1>

            {conflicts.length === 0 && (
                <div className="bg-green-900/30 border border-green-500 p-5 rounded-xl text-green-300">
                    ✔ No hay conflictos de sobrecarga. ¡Buen trabajo!
                </div>
            )}

            {conflicts.map((c) => (
                <div
                    key={c.id}
                    className="p-5 rounded-xl border border-red-500 bg-red-900/20 space-y-3"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-red-300 text-lg">Sobrecarga detectada</p>
                            <p className="text-sm text-red-400 mt-1">Fecha: {c.date}</p>
                            <p className="text-sm text-red-400">
                                Total de horas ese día: <span className="font-bold">{c.hours}h</span>
                            </p>
                        </div>
                        <button
                            onClick={() => resolveConflict(c.id)}
                            className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-xl transition"
                        >
                            Marcar resuelto
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}