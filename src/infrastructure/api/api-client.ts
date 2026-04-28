import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar el formato de respuesta de NestJS que definiste
apiClient.interceptors.response.use(
  (response) => response.data.data, // Extraemos el 'data' del envoltorio { success: true, data: ... }
  (error) => {
    const responseData = error.response?.data;
    // Handle structured error response { success: false, error: "..." }
    if (responseData?.error) {
      return Promise.reject(new Error(responseData.error));
    }
    // Handle NestJS validation error format { message: [...] }
    if (responseData?.message) {
      const msg = Array.isArray(responseData.message) ? responseData.message.join(', ') : responseData.message;
      return Promise.reject(new Error(msg));
    }
    // Fallback
    return Promise.reject(new Error(error.message || 'Error de conexión'));
  }
);
