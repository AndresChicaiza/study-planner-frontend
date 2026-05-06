import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../api/supabase"

export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleRegister = async () => {
        if (!email || !password || !confirm) {
            setError("Completa todos los campos")
            return
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
            return
        }
        if (password !== confirm) {
            setError("Las contraseñas no coinciden")
            return
        }

        setLoading(true)
        setError(null)

        const { error: authError } = await supabase.auth.signUp({ email, password })

        if (authError) {
            setError("Error al registrarse: " + authError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div
                className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm space-y-6"
                role="main"
                aria-label="Formulario de registro"
            >
                {/* Logo + título */}
                <div className="flex flex-col items-center gap-3">
                    <img src="/logo.png" alt="Study Planner logo" className="w-16 h-16" />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
                        <p className="text-slate-400 text-sm mt-1">Regístrate para empezar a planificar</p>
                    </div>
                </div>

                {success ? (
                    <div className="space-y-4">
                        <div className="bg-green-900/40 border border-green-500 text-green-300 p-4 rounded-xl text-sm text-center">
                            ✅ Cuenta creada exitosamente. Ya puedes iniciar sesión.
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            Ir al inicio de sesión
                        </button>
                    </div>
                ) : (
                    <>
                        {error && (
                            <p
                                role="alert"
                                className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-lg text-sm"
                            >
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
                                    Contraseña <span className="text-slate-500">(mín. 6 caracteres)</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-required="true"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm" className="text-sm text-slate-400 block mb-1">
                                    Confirmar contraseña
                                </label>
                                <input
                                    id="confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                                    className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-required="true"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                aria-busy={loading}
                            >
                                {loading ? "Creando cuenta..." : "Crear cuenta"}
                            </button>

                            <p className="text-center text-sm text-slate-400">
                                ¿Ya tienes cuenta?{" "}
                                <Link to="/" className="text-indigo-400 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}