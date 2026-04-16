import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import PrivateRoute from "./components/PrivateRoute"

import Dashboard from "./pages/Dashboard"
import Today from "./pages/Today"
import Activities from "./pages/Activities"
import Conflicts from "./pages/Conflicts"
import Login from "./pages/Login"
import Analytics from "./pages/Analytics"
import Settings from "./pages/Settings"

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route
                path="/app"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="today" element={<Today />} />
                <Route path="activities" element={<Activities />} />
                <Route path="conflicts" element={<Conflicts />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App