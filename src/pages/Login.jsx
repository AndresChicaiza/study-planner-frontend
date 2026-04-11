import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../api/supabase"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Completa todos los campos")
            return
        }

        setLoading(true)
        setError(null)

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError("Correo o contraseña incorrectos")
            setLoading(false)
            return
        }

        localStorage.setItem("token", data.session.access_token)
        navigate("/app")
    }

    const handleRegister = async () => {
        if (!email || !password) {
            setError("Completa todos los campos")
            return
        }

        setLoading(true)
        setError(null)

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) {
            setError("Error al registrarse: " + authError.message)
            setLoading(false)
            return
        }

        setError(null)
        setLoading(false)
        alert("Revisa tu correo para confirmar tu cuenta")
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-white">Study Planner</h1>
                    <p className="text-slate-400 text-sm mt-1">Inicia sesión para continuar</p>
                </div>

                {error && (
                    <p className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
                        {error}
                    </p>
                )}

                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                    >
                        {loading ? "Cargando..." : "Iniciar sesión"}
                    </button>

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition disabled:opacity-50"
                    >
                        Crear cuenta
                    </button>
                </div>

            </div>
        </div>
    )
}