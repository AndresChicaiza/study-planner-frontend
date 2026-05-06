import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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

        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

        if (authError) {
            setError("Correo o contraseña incorrectos")
            setLoading(false)
            return
        }

        localStorage.setItem("token", data.session.access_token)
        navigate("/app")
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div
                className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm space-y-6"
                role="main"
                aria-label="Formulario de inicio de sesión"
            >
                {/* Logo + título centrado */}
                <div className="flex flex-col items-center gap-3">
                    <img src="/logo.png" alt="Study Planner logo" className="w-16 h-16" />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Study Planner</h1>
                        <p className="text-slate-400 text-sm mt-1">Inicia sesión para continuar</p>
                    </div>
                </div>

                {error && (
                    <p role="alert" className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
                        {error}
                    </p>
                )}

                <div className="space-y-3">
                    <div>
                        <label htmlFor="email" className="text-sm text-slate-400 block mb-1">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm text-slate-400 block mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-required="true"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-busy={loading}
                    >
                        {loading ? "Cargando..." : "Iniciar sesión"}
                    </button>

                    <p className="text-center text-sm text-slate-400">
                        ¿No tienes cuenta?{" "}
                        <Link
                            to="/register"
                            className="text-indigo-400 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                        >
                            Crear cuenta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}