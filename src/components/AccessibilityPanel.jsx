import { useState, useEffect } from "react"

const SHORTCUTS = [
    { key: "Alt + H", action: "Ir a Inicio (Dashboard)" },
    { key: "Alt + T", action: "Ir a Hoy" },
    { key: "Alt + A", action: "Ir a Actividades" },
    { key: "Alt + C", action: "Ir a Conflictos" },
    { key: "Alt + N", action: "Ir a Análisis" },
    { key: "Alt + S", action: "Ir a Configuración" },
]

export default function AccessibilityPanel() {
    const [open, setOpen] = useState(false)
    const [colorblindMode, setColorblindMode] = useState(
        () => localStorage.getItem("colorblind") === "true"
    )

    // Aplicar modo daltónico al body
    useEffect(() => {
        if (colorblindMode) {
            document.body.classList.add("colorblind-mode")
            localStorage.setItem("colorblind", "true")
        } else {
            document.body.classList.remove("colorblind-mode")
            localStorage.setItem("colorblind", "false")
        }
    }, [colorblindMode])

    // Atajos de teclado globales
    useEffect(() => {
        const handleKey = (e) => {
            if (!e.altKey) return

            const routes = {
                h: "/app",
                t: "/app/today",
                a: "/app/activities",
                c: "/app/conflicts",
                n: "/app/analytics",
                s: "/app/settings",
            }

            const key = e.key.toLowerCase()
            if (routes[key]) {
                e.preventDefault()
                window.location.href = routes[key]
            }
        }

        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [])

    return (
        <>
            {/* Botón flotante de accesibilidad */}
            <button
                onClick={() => setOpen(!open)}
                aria-label="Panel de accesibilidad"
                aria-expanded={open}
                title="Opciones de accesibilidad"
                className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg"
            >
                {/* Ícono accesibilidad */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
                    <path d="M12 6v5M9 9l-3 3M15 9l3 3M9 21l3-6 3 6" />
                    <path d="M10 15h4" />
                </svg>
            </button>

            {/* Panel */}
            {open && (
                <div
                    className="fixed bottom-20 right-6 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-5 space-y-5"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Opciones de accesibilidad"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-white text-base">Accesibilidad</h2>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar panel de accesibilidad"
                            className="text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                        >
                            ✕
                        </button>
                    </div>

                    {/* WCAG — Modo daltónico */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-300">
                            Paleta para daltonismo
                        </p>
                        <p className="text-xs text-slate-500">
                            Reemplaza la paleta rojo/verde por colores distinguibles para personas con deuteranopía o protanopía.
                        </p>
                        <button
                            onClick={() => setColorblindMode(!colorblindMode)}
                            role="switch"
                            aria-checked={colorblindMode}
                            className={`w-full py-2.5 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${colorblindMode
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                }`}
                        >
                            {colorblindMode ? "✓ Modo daltónico activado" : "Activar modo daltónico"}
                        </button>

                        {/* Vista previa de colores */}
                        <div className="flex gap-2 mt-2">
                            <div className="flex-1 text-center space-y-1">
                                <p className="text-xs text-slate-500">Normal</p>
                                <div className="flex gap-1 justify-center">
                                    <span className="w-5 h-5 rounded" style={{ background: "#22c55e" }} title="Completado"></span>
                                    <span className="w-5 h-5 rounded" style={{ background: "#ef4444" }} title="Vencido"></span>
                                    <span className="w-5 h-5 rounded" style={{ background: "#eab308" }} title="Pendiente"></span>
                                </div>
                            </div>
                            <div className="flex-1 text-center space-y-1">
                                <p className="text-xs text-slate-500">Daltónico</p>
                                <div className="flex gap-1 justify-center">
                                    <span className="w-5 h-5 rounded" style={{ background: "#3b82f6" }} title="Completado"></span>
                                    <span className="w-5 h-5 rounded" style={{ background: "#f97316" }} title="Vencido"></span>
                                    <span className="w-5 h-5 rounded" style={{ background: "#a855f7" }} title="Pendiente"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* WCAG — Atajos de teclado */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-300">
                            Atajos de teclado
                        </p>
                        <p className="text-xs text-slate-500">
                            Navega por la app sin usar el ratón.
                        </p>
                        <div className="space-y-1.5">
                            {SHORTCUTS.map(({ key, action }) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">{action}</span>
                                    <kbd className="text-xs bg-slate-800 border border-slate-600 text-slate-300 px-2 py-0.5 rounded font-mono">
                                        {key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Skip link info */}
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-300">Navegación por teclado</p>
                        <p className="text-xs text-slate-500">
                            Presiona <kbd className="bg-slate-800 border border-slate-600 text-slate-300 px-1 rounded font-mono text-xs">Tab</kbd> para navegar entre elementos. Al cargar la página, presiona <kbd className="bg-slate-800 border border-slate-600 text-slate-300 px-1 rounded font-mono text-xs">Tab</kbd> una vez para activar el skip link y saltar al contenido principal.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}