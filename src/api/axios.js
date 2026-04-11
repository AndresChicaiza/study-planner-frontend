import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
})

// Agregar token a cada request
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Si el servidor responde 401, limpiar sesión y redirigir al login
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/"
        }
        return Promise.reject(error)
    }
)

export default api