import { useEffect, useState, useMemo } from "react"
import PropTypes from "prop-types"
import { supabase } from "../api/supabase"
import { AuthContext } from "./AuthContext"

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Al cargar, verificar si hay sesión activa y renovarla automáticamente
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user)
                localStorage.setItem("token", session.access_token)
            } else {
                setUser(null)
                localStorage.removeItem("token")
            }
            setLoading(false)
        })

        // Escuchar cambios de sesión — renueva el token automáticamente
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "TOKEN_REFRESHED" && session) {
                    // Token renovado automáticamente por Supabase
                    setUser(session.user)
                    localStorage.setItem("token", session.access_token)
                } else if (event === "SIGNED_IN" && session) {
                    setUser(session.user)
                    localStorage.setItem("token", session.access_token)
                } else if (event === "SIGNED_OUT") {
                    setUser(null)
                    localStorage.removeItem("token")
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const logout = async () => {
        await supabase.auth.signOut()
        localStorage.removeItem("token")
        setUser(null)
    }

    const value = useMemo(() => ({ user, loading, logout }), [user, loading])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
}