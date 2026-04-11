import { useAuth } from "../context/useAuth"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    return (
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">

            <h1 className="font-bold text-lg text-white">
                Study Planner
            </h1>

            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition text-white"
            >
                Cerrar sesión
            </button>

        </div>
    )
}