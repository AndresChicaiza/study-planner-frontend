import { useState } from "react"
import { NavLink } from "react-router-dom"

const links = [
    { to: "/app", label: "Dashboard", end: true },
    { to: "/app/today", label: "Hoy" },
    { to: "/app/activities", label: "Actividades" },
    { to: "/app/conflicts", label: "Conflictos" },
    { to: "/app/analytics", label: "Analytics" },
]

export default function Sidebar() {
    const [open, setOpen] = useState(false)

    const linkStyle = "block p-3 rounded-xl hover:bg-slate-800 transition text-slate-300 text-sm"
    const activeStyle = "bg-indigo-600 text-white"

    const navLinks = links.map(({ to, label, end }) => (
        <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : ""}`
            }
        >
            {label}
        </NavLink>
    ))

    return (
        <>
            {/* Botón hamburguesa — solo visible en móvil */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2 rounded-lg text-white border border-slate-700"
                aria-label="Abrir menú"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </button>

            {/* Overlay — solo en móvil cuando está abierto */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50
                    w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-6 min-h-screen
                    transform transition-transform duration-200
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-indigo-400">Planner</h1>
                    {/* Botón cerrar — solo en móvil */}
                    <button
                        onClick={() => setOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white transition"
                        aria-label="Cerrar menú"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <nav className="space-y-1">
                    {navLinks}
                </nav>
            </aside>
        </>
    )
}