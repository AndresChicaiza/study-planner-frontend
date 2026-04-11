import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function Activities() {
    const [activities, setActivities] = useState([])
    const [title, setTitle] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [loading, setLoading] = useState(true)

    const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState("")
    const [editDueDate, setEditDueDate] = useState("")

    const [subtaskTitle, setSubtaskTitle] = useState({})
    const [subtaskHours, setSubtaskHours] = useState({})
    const [subtaskDate, setSubtaskDate] = useState({})
    const [realHoursInput, setRealHoursInput] = useState({})

    const loadActivities = async () => {
        try {
            const res = await api.get("/activities/")
            setActivities(res.data)
        } catch {
            toast.error("Error cargando actividades")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadActivities() }, [])

    // ================= CREAR ACTIVIDAD =================

    const createActivity = async () => {
        if (!title.trim()) return toast.error("Debes escribir un título")
        if (!dueDate) return toast.error("Debes seleccionar una fecha de entrega")

        await toast.promise(
            api.post("/activities/", { title, due_date: dueDate }),
            {
                loading: "Creando actividad...",
                success: "Actividad creada",
                error: "Error creando actividad",
            }
        )
        setTitle("")
        setDueDate("")
        loadActivities()
    }

    // ================= EDITAR ACTIVIDAD =================

    const startEdit = (a) => {
        setEditingId(a.id)
        setEditTitle(a.title)
        setEditDueDate(a.due_date || "")
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditTitle("")
        setEditDueDate("")
    }

    const saveEdit = async (id) => {
        if (!editTitle.trim()) return toast.error("El título no puede estar vacío")

        await toast.promise(
            api.patch(`/activities/${id}/`, {
                title: editTitle,
                due_date: editDueDate || undefined,
            }),
            {
                loading: "Guardando cambios...",
                success: "Actividad actualizada",
                error: "Error editando actividad",
            }
        )
        cancelEdit()
        loadActivities()
    }

    // ================= ELIMINAR ACTIVIDAD =================

    const deleteActivity = async (id) => {
        if (!confirm("¿Eliminar esta actividad y todas sus subtareas?")) return

        await toast.promise(
            api.delete(`/activities/${id}/`),
            {
                loading: "Eliminando...",
                success: "Actividad eliminada",
                error: "Error eliminando actividad",
            }
        )
        loadActivities()
    }

    // ================= CREAR SUBTAREA =================

    const createSubtask = async (activityId) => {
        const name = subtaskTitle[activityId]
        const hours = subtaskHours[activityId]
        const targetDate = subtaskDate[activityId]

        if (!name || !hours) return toast.error("Completa título y horas")
        if (!targetDate) return toast.error("Selecciona una fecha para la subtarea")

        await toast.promise(
            api.post("/subtasks/create/", {
                title: name,
                estimated_hours: hours,
                target_date: targetDate,
                activity: activityId,
            }),
            {
                loading: "Creando subtarea...",
                success: "Subtarea creada",
                error: "Error creando subtarea",
            }
        )

        setSubtaskTitle({ ...subtaskTitle, [activityId]: "" })
        setSubtaskHours({ ...subtaskHours, [activityId]: "" })
        setSubtaskDate({ ...subtaskDate, [activityId]: "" })
        loadActivities()
    }

    // ================= COMPLETAR SUBTAREA =================

    const toggleSubtask = async (s) => {
        try {
            if (!s.completed) {
                const hours = realHoursInput[s.id]
                if (hours !== undefined && hours !== "") {
                    await api.patch(`/subtasks/${s.id}/hours/`, {
                        real_hours: parseFloat(hours),
                    })
                }
            }
            await api.patch(`/subtasks/${s.id}/complete/`)
            setRealHoursInput({ ...realHoursInput, [s.id]: "" })
            toast.success(s.completed ? "Subtarea desmarcada" : "Subtarea completada")
            loadActivities()
        } catch {
            toast.error("Error actualizando subtarea")
        }
    }

    // ================= ELIMINAR SUBTAREA =================

    const deleteSubtask = async (id) => {
        await toast.promise(
            api.delete(`/subtasks/${id}/delete/`),
            {
                loading: "Eliminando...",
                success: "Subtarea eliminada",
                error: "Error eliminando subtarea",
            }
        )
        loadActivities()
    }

    // ================= UI =================

    if (loading) return <p className="text-white">Cargando actividades...</p>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Actividades</h1>

            {/* CREAR ACTIVIDAD */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <p className="text-sm text-slate-400 font-medium">Nueva actividad</p>
                <div className="flex gap-2 flex-wrap">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createActivity()}
                        placeholder="Título de la actividad"
                        className="bg-slate-800 p-2 rounded-xl flex-1 min-w-48 text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={createActivity}
                        className="bg-indigo-600 hover:bg-indigo-700 px-4 rounded-xl transition text-white"
                    >
                        Crear
                    </button>
                </div>
            </div>

            {activities.length === 0 && (
                <p className="text-slate-400 text-sm">No tienes actividades aún.</p>
            )}

            {/* LISTA */}
            {activities.map((a) => (
                <div key={a.id} className="bg-slate-900 p-5 rounded-xl space-y-4 border border-slate-800">

                    {/* CABECERA */}
                    {editingId === a.id ? (
                        <div className="flex gap-2 flex-wrap">
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="bg-slate-800 p-2 rounded-xl flex-1 text-white border border-indigo-500 focus:outline-none"
                            />
                            <input
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                            <button onClick={() => saveEdit(a.id)} className="bg-green-600 hover:bg-green-700 px-4 rounded-xl transition text-white">
                                Guardar
                            </button>
                            <button onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-xl transition text-white">
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="font-bold text-lg text-white">{a.title}</h2>
                                {a.due_date && (
                                    <p className="text-xs text-slate-400 mt-1">Entrega: {a.due_date}</p>
                                )}
                                {a.progress !== undefined && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="w-32 bg-slate-700 h-1.5 rounded-full">
                                            <div
                                                className="h-1.5 rounded-full bg-indigo-500 transition-all"
                                                style={{ width: `${a.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400">{a.progress}%</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(a)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-xl transition text-white text-sm">
                                    Editar
                                </button>
                                <button onClick={() => deleteActivity(a.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl transition text-white text-sm">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CREAR SUBTAREA */}
                    <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-medium">Agregar subtarea</p>
                        <div className="flex gap-2 flex-wrap">
                            <input
                                placeholder="Título"
                                value={subtaskTitle[a.id] || ""}
                                onChange={(e) => setSubtaskTitle({ ...subtaskTitle, [a.id]: e.target.value })}
                                className="bg-slate-800 p-2 rounded-xl flex-1 min-w-32 text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                            <input
                                type="number"
                                placeholder="Horas"
                                value={subtaskHours[a.id] || ""}
                                onChange={(e) => setSubtaskHours({ ...subtaskHours, [a.id]: e.target.value })}
                                className="bg-slate-800 p-2 rounded-xl w-20 text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                            <input
                                type="date"
                                value={subtaskDate[a.id] || ""}
                                onChange={(e) => setSubtaskDate({ ...subtaskDate, [a.id]: e.target.value })}
                                className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                                onClick={() => createSubtask(a.id)}
                                className="bg-green-600 hover:bg-green-700 px-4 rounded-xl transition text-white"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* LISTA SUBTAREAS */}
                    {a.subtasks?.length === 0 && (
                        <p className="text-slate-600 text-xs">Sin subtareas aún</p>
                    )}

                    {a.subtasks?.map((s) => (
                        <div
                            key={s.id}
                            className={`p-3 rounded-xl border ${s.completed
                                ? "bg-green-900/20 border-green-800"
                                : "bg-slate-800 border-slate-700"
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`font-medium text-white ${s.completed ? "line-through opacity-50" : ""}`}>
                                        {s.title}
                                    </p>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                        <span>{s.estimated_hours}h estimadas</span>
                                        {s.real_hours > 0 && (
                                            <span className="text-green-400">{s.real_hours}h reales</span>
                                        )}
                                        {s.target_date && <span>Para: {s.target_date}</span>}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteSubtask(s.id)}
                                    className="bg-red-600/70 hover:bg-red-600 px-2 py-1 rounded-lg transition text-white text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            {!s.completed && (
                                <div className="flex gap-2 mt-2 items-center">
                                    <input
                                        type="number"
                                        placeholder="Horas reales (opcional)"
                                        value={realHoursInput[s.id] || ""}
                                        onChange={(e) => setRealHoursInput({ ...realHoursInput, [s.id]: e.target.value })}
                                        className="bg-slate-700 p-1.5 rounded-lg text-white text-xs border border-slate-600 focus:outline-none focus:border-indigo-500 w-44"
                                    />
                                    <button
                                        onClick={() => toggleSubtask(s)}
                                        className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition text-white text-xs"
                                    >
                                        Completar
                                    </button>
                                </div>
                            )}

                            {s.completed && (
                                <button
                                    onClick={() => toggleSubtask(s)}
                                    className="mt-2 text-xs text-slate-400 hover:text-white transition"
                                >
                                    Desmarcar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}