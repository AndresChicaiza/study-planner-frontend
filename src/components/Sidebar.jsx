import { useState } from "react"
import { NavLink } from "react-router-dom"

const links = [
    { to: "/app", label: "Dashboard", end: true, icon: "📊" },
    { to: "/app/today", label: "Hoy", icon: "📅" },
    { to: "/app/activities", label: "Actividades", icon: "📋" },
    { to: "/app/conflicts", label: "Conflictos", icon: "⚠️" },
    { to: "/app/analytics", label: "Análisis", icon: "📈" },
    { to: "/app/settings", label: "Configuración", icon: "⚙️" },
]

export default function Sidebar() {
    const [open, setOpen] = useState(false)

    const linkStyle = "flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
    const activeStyle = "bg-indigo-600 text-white"

    const navLinks = links.map(({ to, label, end, icon }) => (
        <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : ""}`
            }
            aria-label={label}
        >
            <span aria-hidden="true">{icon}</span>
            <span>{label}</span>
        </NavLink>
    ))

    return (
        <>
            {/* Botón hamburguesa — solo móvil */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2 rounded-lg text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Abrir menú de navegación"
                aria-expanded={open}
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50
                    w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-6 min-h-screen
                    transform transition-transform duration-200
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
                role="navigation"
                aria-label="Menú principal"
            >
                <div className="flex items-center justify-between">
                    {/* Logo + nombre */}
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Study Planner" className="w-8 h-8" />
                        <h1 className="text-xl font-bold text-indigo-400">Study Planner</h1>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                        aria-label="Cerrar menú"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <nav className="space-y-1" aria-label="Navegación principal">
                    {navLinks}
                </nav>
            </aside>
        </>
    )
}