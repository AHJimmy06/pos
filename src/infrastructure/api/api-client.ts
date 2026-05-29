import axios from "axios";

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor para inyectar el token de autenticación
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("pos_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Interzor para manejar el formato de respuesta de NestJS
apiClient.interceptors.response.use(
	(response) => {
		const data = response.data;

		// Verificar si es respuesta paginada: { success: true, data: { data: [], total } }
		if (data?.success === true && data?.data) {
			const innerData = data.data;

			if (
				Array.isArray(innerData.data) &&
				typeof innerData.total === "number"
			) {
				return innerData; // Devolver { data: [], total }
			}
			return innerData;
		}

		return data;
	},
	(error) => {
		const responseData = error.response?.data;
		if (responseData?.error) {
			return Promise.reject(new Error(responseData.error));
		}
		if (responseData?.message) {
			const msg = Array.isArray(responseData.message)
				? responseData.message.join(", ")
				: responseData.message;
			return Promise.reject(new Error(msg));
		}
		return Promise.reject(new Error(error.message || "Error de conexión"));
	},
);
