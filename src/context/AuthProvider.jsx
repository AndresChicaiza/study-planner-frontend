import { useEffect, useState, useMemo } from "react"
import PropTypes from "prop-types"
import { supabase } from "../api/supabase"
import { AuthContext } from "./AuthContext"

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user)
                localStorage.setItem("token", session.access_token)
            }
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) {
                    setUser(session.user)
                    localStorage.setItem("token", session.access_token)
                } else {
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