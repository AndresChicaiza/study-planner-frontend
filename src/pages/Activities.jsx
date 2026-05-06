import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"

const TAG_OPTIONS = [
    { value: "tarea", label: "Tarea", color: "bg-blue-900/50 text-blue-300 border-blue-600" },
    { value: "examen", label: "Examen", color: "bg-red-900/50 text-red-300 border-red-600" },
    { value: "proyecto", label: "Proyecto", color: "bg-purple-900/50 text-purple-300 border-purple-600" },
    { value: "lectura", label: "Lectura", color: "bg-green-900/50 text-green-300 border-green-600" },
]

function TagBadge({ tag }) {
    const opt = TAG_OPTIONS.find(t => t.value === tag) || TAG_OPTIONS[0]
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${opt.color}`}>
            {opt.label}
        </span>
    )
}

export default function Activities() {
    const [activities, setActivities] = useState([])
    const [title, setTitle] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [tag, setTag] = useState("tarea")
    const [loading, setLoading] = useState(true)

    const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState("")
    const [editDueDate, setEditDueDate] = useState("")
    const [editTag, setEditTag] = useState("tarea")

    const [subtaskTitle, setSubtaskTitle] = useState({})
    const [subtaskHours, setSubtaskHours] = useState({})
    const [subtaskDate, setSubtaskDate] = useState({})

    const [completeModal, setCompleteModal] = useState(null)
    const [realHours, setRealHours] = useState("")
    const [note, setNote] = useState("")

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
            api.post("/activities/", { title, due_date: dueDate, tag }),
            { loading: "Creando...", success: "Actividad creada", error: "Error creando actividad" }
        )
        setTitle("")
        setDueDate("")
        setTag("tarea")
        loadActivities()
    }

    const startEdit = (a) => {
        setEditingId(a.id)
        setEditTitle(a.title)
        setEditDueDate(a.due_date || "")
        setEditTag(a.tag || "tarea")
    }
    const cancelEdit = () => { setEditingId(null); setEditTitle(""); setEditDueDate("") }

    const saveEdit = async (id) => {
        if (!editTitle.trim()) return toast.error("El título no puede estar vacío")
        await toast.promise(
            api.patch(`/activities/${id}/`, { title: editTitle, due_date: editDueDate || undefined, tag: editTag }),
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
                title: name, estimated_hours: hours,
                target_date: targetDate, activity: activityId,
            }),
            { loading: "Creando...", success: "Subtarea creada", error: "Error creando subtarea" }
        )
        setSubtaskTitle({ ...subtaskTitle, [activityId]: "" })
        setSubtaskHours({ ...subtaskHours, [activityId]: "" })
        setSubtaskDate({ ...subtaskDate, [activityId]: "" })
        loadActivities()
    }

    const openCompleteModal = (s) => { setCompleteModal(s); setRealHours(""); setNote("") }

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

    const unmarkComplete = async (s) => {
        try {
            await api.patch(`/subtasks/${s.id}/complete/`)
            toast.success("Subtarea desmarcada")
            loadActivities()
        } catch {
            toast.error("Error actualizando subtarea")
        }
    }

    const confirmPostpone = async () => {
        if (!postponeDate) return toast.error("Selecciona una nueva fecha")
        await toast.promise(
            api.patch(`/subtasks/${postponeModal.id}/postpone/`, {
                target_date: postponeDate,
                note: postponeNote || undefined,
            }),
            { loading: "Posponiendo...", success: "Subtarea pospuesta", error: "Error al posponer" }
        )
        setPostponeModal(null); setPostponeDate(""); setPostponeNote("")
        loadActivities()
    }

    const deleteSubtask = async (id) => {
        await toast.promise(
            api.delete(`/subtasks/${id}/delete/`),
            { loading: "Eliminando...", success: "Subtarea eliminada", error: "Error eliminando" }
        )
        loadActivities()
    }

    if (loading) return <p className="text-white text-center">Cargando actividades...</p>

    return (
        <div className="space-y-6">
            {/* Título centrado — H8 Diseño estético */}
            <h1 className="text-3xl font-bold text-white text-center">Actividades</h1>

            {/* CREAR ACTIVIDAD */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <p className="text-sm text-slate-400 font-medium">Nueva actividad</p>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-48 space-y-1">
                        <label htmlFor="act-title" className="text-xs text-slate-400">Título *</label>
                        <input
                            id="act-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && createActivity()}
                            placeholder="Ej: Parcial de Cálculo"
                            className="w-full bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-required="true"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="act-date" className="text-xs text-slate-400">Fecha entrega *</label>
                        <input
                            id="act-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-required="true"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="act-tag" className="text-xs text-slate-400">Tipo</label>
                        <select
                            id="act-tag"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-[42px]"
                        >
                            {TAG_OPTIONS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={createActivity}
                            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl transition text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            aria-label="Crear nueva actividad"
                        >
                            Crear
                        </button>
                    </div>
                </div>
            </div>

            {activities.length === 0 && (
                <div className="text-center py-8 space-y-2">
                    <p className="text-slate-300 text-base">No tienes actividades aún.</p>
                    <p className="text-slate-500 text-sm">Crea una actividad para empezar a planificar.</p>
                </div>
            )}

            {/* LISTA */}
            {activities.map((a) => (
                <div key={a.id} className="bg-slate-900 p-5 rounded-xl space-y-4 border border-slate-800">

                    {editingId === a.id ? (
                        <div className="flex gap-2 flex-wrap">
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                aria-label="Editar título de actividad"
                                className="bg-slate-800 p-2 rounded-xl flex-1 text-white border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <input
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <select
                                value={editTag}
                                onChange={(e) => setEditTag(e.target.value)}
                                aria-label="Tipo de actividad"
                                className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                {TAG_OPTIONS.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <button onClick={() => saveEdit(a.id)} className="bg-green-600 hover:bg-green-700 px-4 rounded-xl transition text-white focus:outline-none focus:ring-2 focus:ring-green-400">Guardar</button>
                            <button onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-xl transition text-white focus:outline-none focus:ring-2 focus:ring-slate-400">Cancelar</button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="font-bold text-lg text-white">{a.title}</h2>
                                    <TagBadge tag={a.tag} />
                                </div>
                                {a.due_date && (
                                    <p className="text-xs text-slate-400 mt-1">Entrega: {a.due_date}</p>
                                )}
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-40 bg-slate-700 h-2 rounded-full" role="progressbar" aria-valuenow={a.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso ${a.progress}%`}>
                                        <div
                                            className={`h-2 rounded-full transition-all ${a.progress === 100 ? "bg-green-500" : a.progress >= 50 ? "bg-indigo-500" : "bg-yellow-500"}`}
                                            style={{ width: `${a.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {a.progress}% ({a.subtasks?.filter(s => s.completed).length || 0}/{a.subtasks?.length || 0})
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(a)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-xl transition text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" aria-label={`Editar ${a.title}`}>Editar</button>
                                <button onClick={() => deleteActivity(a.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl transition text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Eliminar ${a.title}`}>Eliminar</button>
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
                                aria-label="Título de la subtarea"
                                className="bg-slate-800 p-2 rounded-xl flex-1 min-w-32 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <input
                                type="number"
                                placeholder="Horas"
                                value={subtaskHours[a.id] || ""}
                                onChange={(e) => setSubtaskHours({ ...subtaskHours, [a.id]: e.target.value })}
                                aria-label="Horas estimadas"
                                className="bg-slate-800 p-2 rounded-xl w-20 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <input
                                type="date"
                                value={subtaskDate[a.id] || ""}
                                onChange={(e) => setSubtaskDate({ ...subtaskDate, [a.id]: e.target.value })}
                                aria-label="Fecha de la subtarea"
                                className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <button
                                onClick={() => createSubtask(a.id)}
                                aria-label="Agregar subtarea"
                                className="bg-green-600 hover:bg-green-700 px-4 rounded-xl transition text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* LISTA SUBTAREAS */}
                    {a.subtasks?.length === 0 && (
                        <p className="text-slate-600 text-sm">Sin subtareas aún</p>
                    )}

                    {a.subtasks?.map((s) => (
                        <div
                            key={s.id}
                            className={`p-3 rounded-xl border ${s.completed ? "bg-green-900/20 border-green-700" : s.status === "postponed" ? "bg-yellow-900/20 border-yellow-700" : "bg-slate-800 border-slate-700"}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className={`font-medium text-white ${s.completed ? "line-through opacity-50" : ""}`}>{s.title}</p>
                                        {s.status === "postponed" && (
                                            <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-700">Pospuesta</span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                                        <span>{s.estimated_hours}h estimadas</span>
                                        {s.real_hours > 0 && <span className="text-green-400">{s.real_hours}h reales</span>}
                                        {s.target_date && <span>Para: {s.target_date}</span>}
                                    </div>
                                    {s.note && <p className="text-xs text-slate-400 italic mt-1">📝 {s.note}</p>}
                                </div>
                                <button
                                    onClick={() => deleteSubtask(s.id)}
                                    aria-label={`Eliminar subtarea ${s.title}`}
                                    className="bg-red-600/70 hover:bg-red-600 px-2 py-1 rounded-lg transition text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                    ✕
                                </button>
                            </div>

                            {!s.completed && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <button
                                        onClick={() => openCompleteModal(s)}
                                        className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        aria-label={`Completar subtarea ${s.title}`}
                                    >
                                        Completar
                                    </button>
                                    {s.status !== "postponed" && (
                                        <button
                                            onClick={() => { setPostponeModal(s); setPostponeDate(""); setPostponeNote("") }}
                                            className="bg-yellow-600/70 hover:bg-yellow-600 px-3 py-1.5 rounded-lg transition text-white text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            aria-label={`Posponer subtarea ${s.title}`}
                                        >
                                            Posponer
                                        </button>
                                    )}
                                </div>
                            )}

                            {s.completed && (
                                <button
                                    onClick={() => unmarkComplete(s)}
                                    className="mt-2 text-xs text-slate-400 hover:text-white transition focus:outline-none focus:ring-1 focus:ring-slate-400 rounded"
                                    aria-label={`Desmarcar subtarea ${s.title}`}
                                >
                                    Desmarcar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ))}

            {/* MODAL COMPLETAR */}
            {completeModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Completar subtarea">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h2 className="font-bold text-white text-lg">Completar subtarea</h2>
                        <p className="text-slate-400 text-sm">{completeModal.title}</p>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="real-hours" className="text-xs text-slate-400 block mb-1">Horas reales (opcional)</label>
                                <input
                                    id="real-hours"
                                    type="number"
                                    value={realHours}
                                    onChange={(e) => setRealHours(e.target.value)}
                                    placeholder={`Estimadas: ${completeModal.estimated_hours}h`}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <div>
                                <label htmlFor="complete-note" className="text-xs text-slate-400 block mb-1">Nota (opcional)</label>
                                <textarea
                                    id="complete-note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="¿Algún comentario sobre esta tarea?"
                                    rows={3}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={confirmComplete} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-400">Confirmar</button>
                            <button onClick={() => setCompleteModal(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-400">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL POSPONER */}
            {postponeModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Posponer subtarea">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h2 className="font-bold text-white text-lg">Posponer subtarea</h2>
                        <p className="text-slate-400 text-sm">{postponeModal.title}</p>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="postpone-date" className="text-xs text-slate-400 block mb-1">Nueva fecha *</label>
                                <input
                                    id="postpone-date"
                                    type="date"
                                    value={postponeDate}
                                    onChange={(e) => setPostponeDate(e.target.value)}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    aria-required="true"
                                />
                            </div>
                            <div>
                                <label htmlFor="postpone-note" className="text-xs text-slate-400 block mb-1">Razón (opcional)</label>
                                <textarea
                                    id="postpone-note"
                                    value={postponeNote}
                                    onChange={(e) => setPostponeNote(e.target.value)}
                                    placeholder="¿Por qué la estás posponiendo?"
                                    rows={2}
                                    className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={confirmPostpone} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-yellow-400">Posponer</button>
                            <button onClick={() => setPostponeModal(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-400">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}