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

    // C1 — estado para completar con nota y horas reales
    const [completeModal, setCompleteModal] = useState(null)
    const [realHours, setRealHours] = useState("")
    const [note, setNote] = useState("")

    // C1 — estado para posponer
    const [postponeModal, setPostponeModal] = useState(null)
    const [postponeDate, setPostponeDate] = useState("")
    const [postponeNote, setPostponeNote] = useState("")

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

    // ================= ACTIVIDADES =================

    const createActivity = async () => {
        if (!title.trim()) return toast.error("Debes escribir un título")
        if (!dueDate) return toast.error("Debes seleccionar una fecha de entrega")

        await toast.promise(
            api.post("/activities/", { title, due_date: dueDate }),
            { loading: "Creando...", success: "Actividad creada", error: "Error creando actividad" }
        )
        setTitle("")
        setDueDate("")
        loadActivities()
    }

    const startEdit = (a) => { setEditingId(a.id); setEditTitle(a.title); setEditDueDate(a.due_date || "") }
    const cancelEdit = () => { setEditingId(null); setEditTitle(""); setEditDueDate("") }

    const saveEdit = async (id) => {
        if (!editTitle.trim()) return toast.error("El título no puede estar vacío")
        await toast.promise(
            api.patch(`/activities/${id}/`, { title: editTitle, due_date: editDueDate || undefined }),
            { loading: "Guardando...", success: "Actividad actualizada", error: "Error editando" }
        )
        cancelEdit()
        loadActivities()
    }

    const deleteActivity = async (id) => {
        if (!confirm("¿Eliminar esta actividad y todas sus subtareas?")) return
        await toast.promise(
            api.delete(`/activities/${id}/`),
            { loading: "Eliminando...", success: "Actividad eliminada", error: "Error eliminando" }
        )
        loadActivities()
    }

    // ================= SUBTAREAS =================

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
            { loading: "Creando...", success: "Subtarea creada", error: "Error creando subtarea" }
        )

        setSubtaskTitle({ ...subtaskTitle, [activityId]: "" })
        setSubtaskHours({ ...subtaskHours, [activityId]: "" })
        setSubtaskDate({ ...subtaskDate, [activityId]: "" })
        loadActivities()
    }

    // C1 — Abrir modal de completar
    const openCompleteModal = (s) => {
        setCompleteModal(s)
        setRealHours("")
        setNote("")
    }

    // C1 — Confirmar completar con nota y horas reales
    const confirmComplete = async () => {
        if (!completeModal) return
        try {
            await api.patch(`/subtasks/${completeModal.id}/complete/`, {
                real_hours: realHours ? parseFloat(realHours) : undefined,
                note: note || undefined,
            })
            toast.success(completeModal.completed ? "Subtarea desmarcada" : "Subtarea completada ✓")
            setCompleteModal(null)
            loadActivities()
        } catch {
            toast.error("Error actualizando subtarea")
        }
    }

    // C1 — Desmarcar directamente sin modal
    const unmarkComplete = async (s) => {
        try {
            await api.patch(`/subtasks/${s.id}/complete/`)
            toast.success("Subtarea desmarcada")
            loadActivities()
        } catch {
            toast.error("Error actualizando subtarea")
        }
    }

    // C1 — Posponer subtarea
    const confirmPostpone = async () => {
        if (!postponeDate) return toast.error("Selecciona una nueva fecha")
        await toast.promise(
            api.patch(`/subtasks/${postponeModal.id}/postpone/`, {
                target_date: postponeDate,
                note: postponeNote || undefined,
            }),
            { loading: "Posponiendo...", success: "Subtarea pospuesta", error: "Error al posponer" }
        )
        setPostponeModal(null)
        setPostponeDate("")
        setPostponeNote("")
        loadActivities()
    }

    const deleteSubtask = async (id) => {
        await toast.promise(
            api.delete(`/subtasks/${id}/delete/`),
            { loading: "Eliminando...", success: "Subtarea eliminada", error: "Error eliminando" }
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
                    <button onClick={createActivity} className="bg-indigo-600 hover:bg-indigo-700 px-4 rounded-xl transition text-white">
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
                            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                className="bg-slate-800 p-2 rounded-xl flex-1 text-white border border-indigo-500 focus:outline-none" />
                            <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)}
                                className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:border-indigo-500" />
                            <button onClick={() => saveEdit(a.id)} className="bg-green-600 hover:bg-green-700 px-4 rounded-xl transition text-white">Guardar</button>
                            <button onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-xl transition text-white">Cancelar</button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="font-bold text-lg text-white">{a.title}</h2>
                                {a.due_date && <p className="text-xs text-slate-400 mt-1">Entrega: {a.due_date}</p>}
                                {/* C2 — Progreso visible y consistente */}
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-40 bg-slate-700 h-2 rounded-full">
                                        <div
                                            className={`h-2 rounded-full transition-all ${a.progress === 100 ? "bg-green-500" : a.progress >= 50 ? "bg-indigo-500" : "bg-yellow-500"}`}
                                            style={{ width: `${a.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {a.progress}% ({a.subtasks?.filter(s => s.completed).length || 0}/{a.subtasks?.length || 0} subtareas)
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(a)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-xl transition text-white text-sm">Editar</button>
                                <button onClick={() => deleteActivity(a.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl transition text-white text-sm">Eliminar</button>
                            </div>
                        </div>
                    )}

                    {/* CREAR SUBTAREA */}
                    <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-medium">Agregar subtarea</p>
                        <div className="flex gap-2 flex-wrap">
                            <input placeholder="Título" value={subtaskTitle[a.id] || ""}
                                onChange={(e) => setSubtaskTitle({ ...subtaskTitle, [a.id]: e.target.value })}
                                className="bg-slate-800 p-2 rounded-xl flex-1 min-w-32 text-white border border-slate-700 focus:outline-none focus:border-indigo-500" />
                            <input type="number" placeholder="Horas" value={subtaskHours[a.id] || ""}
                                onChange={(e) => setSubtaskHours({ ...subtaskHours, [a.id]: e.target.value })}
                                className="bg-slate-800 p-2 rounded-xl w-20 text-white border border-slate-700 focus:outline-none focus:border-indigo-500" />
                            <input type="date" value={subtaskDate[a.id] || ""}
                                onChange={(e) => setSubtaskDate({ ...subtaskDate, [a.id]: e.target.value })}
                                className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:border-indigo-500" />
                            <button onClick={() => createSubtask(a.id)} className="bg-green-600 hover:bg-green-700 px-4 rounded-xl transition text-white">+</button>
                        </div>
                    </div>

                    {/* LISTA SUBTAREAS */}
                    {a.subtasks?.length === 0 && <p className="text-slate-600 text-xs">Sin subtareas aún</p>}

                    {a.subtasks?.map((s) => (
                        <div key={s.id} className={`p-3 rounded-xl border ${
                            s.completed ? "bg-green-900/20 border-green-800" :
                            s.status === "postponed" ? "bg-yellow-900/20 border-yellow-700" :
                            "bg-slate-800 border-slate-700"
                        }`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className={`font-medium text-white ${s.completed ? "line-through opacity-50" : ""}`}>{s.title}</p>
                                        {s.status === "postponed" && (
                                            <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full">Pospuesta</span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                                        <span>{s.estimated_hours}h estimadas</span>
                                        {s.real_hours > 0 && <span className="text-green-400">{s.real_hours}h reales</span>}
                                        {s.target_date && <span>Para: {s.target_date}</span>}
                                    </div>
                                    {/* C1 — Mostrar nota si existe */}
                                    {s.note && (
                                        <p className="text-xs text-slate-500 italic mt-1">📝 {s.note}</p>
                                    )}
                                </div>
                                <button onClick={() => deleteSubtask(s.id)}
                                    className="bg-red-600/70 hover:bg-red-600 px-2 py-1 rounded-lg transition text-white text-xs">✕</button>
                            </div>

                            {/* Acciones según estado */}
                            {!s.completed && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <button onClick={() => openCompleteModal(s)}
                                        className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition text-white text-xs">
                                        Completar
                                    </button>
                                    {s.status !== "postponed" && (
                                        <button onClick={() => { setPostponeModal(s); setPostponeDate(""); setPostponeNote("") }}
                                            className="bg-yellow-600/70 hover:bg-yellow-600 px-3 py-1.5 rounded-lg transition text-white text-xs">
                                            Posponer
                                        </button>
                                    )}
                                </div>
                            )}

                            {s.completed && (
                                <button onClick={() => unmarkComplete(s)}
                                    className="mt-2 text-xs text-slate-400 hover:text-white transition">
                                    Desmarcar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ))}

            {/* MODAL COMPLETAR — C1 */}
            {completeModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h2 className="font-bold text-white text-lg">Completar subtarea</h2>
                        <p className="text-slate-400 text-sm">{completeModal.title}</p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Horas reales (opcional)</label>
                                <input type="number" value={realHours} onChange={(e) => setRealHours(e.target.value)}
                                    placeholder={`Estimadas: ${completeModal.estimated_hours}h`}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Nota (opcional)</label>
                                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                                    placeholder="¿Algún comentario sobre esta tarea?"
                                    rows={3}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 resize-none" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={confirmComplete}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition">
                                Confirmar
                            </button>
                            <button onClick={() => setCompleteModal(null)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL POSPONER — C1 */}
            {postponeModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h2 className="font-bold text-white text-lg">Posponer subtarea</h2>
                        <p className="text-slate-400 text-sm">{postponeModal.title}</p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Nueva fecha *</label>
                                <input type="date" value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Razón (opcional)</label>
                                <textarea value={postponeNote} onChange={(e) => setPostponeNote(e.target.value)}
                                    placeholder="¿Por qué la estás posponiendo?"
                                    rows={2}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 resize-none" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={confirmPostpone}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2.5 rounded-xl transition">
                                Posponer
                            </button>
                            <button onClick={() => setPostponeModal(null)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}