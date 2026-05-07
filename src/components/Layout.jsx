import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import AccessibilityPanel from "./AccessibilityPanel"

export default function Layout() {
    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />
                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-slate-950 to-slate-900"
                    tabIndex={-1}
                >
                    <Outlet />
                </main>
            </div>

            {/* Panel flotante de accesibilidad — visible en todas las páginas internas */}
            <AccessibilityPanel />
        </div>
    )
}