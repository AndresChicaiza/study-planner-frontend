import PropTypes from "prop-types"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import Loader from "./Loader"

export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return <Loader />

    if (!user) return <Navigate to="/" replace />

    return children
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
}