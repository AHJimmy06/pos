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
    return Promise.reject(error.response?.data || error.message);
  }
);
