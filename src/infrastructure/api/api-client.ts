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

// Función recursiva para normalizar objetos del dominio (maneja guiones bajos y Value Objects)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(obj: any): any {
	if (Array.isArray(obj)) return obj.map(normalize);
	if (obj === null || typeof obj !== "object" || obj instanceof Date) return obj;

	// Evitar procesar objetos que ya son limpios o de librerías (ej. AxiosResponse)
	if ("config" in obj && "headers" in obj && "request" in obj) return obj;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: any = {};
	for (const key in obj) {
		let value = obj[key];
		let newKey = key;

		// 1. Quitar guion bajo inicial (propiedades privadas serializadas)
		if (key.startsWith("_")) {
			newKey = key.substring(1);
		}

		// 2. Desempaquetar Value Objects { value: ... }
		// Solo si tiene exactamente una propiedad llamada 'value' o es un objeto simple de valor
		if (
			value &&
			typeof value === "object" &&
			"value" in value &&
			Object.keys(value).length === 1
		) {
			value = value.value;
		}

		result[newKey] = normalize(value);
	}
	return result;
}

// Interzor para manejar el formato de respuesta de NestJS
apiClient.interceptors.response.use(
	(response) => {
		const data = response.data;

		// Si es una respuesta exitosa con el wrapper de NestJS { success: true, data: ... }
		if (
			data &&
			typeof data === "object" &&
			data.success === true &&
			"data" in data
		) {
			// Devolvemos el contenido de 'data' normalizado
			response.data = normalize(data.data);
		} else {
			// Normalizar incluso si no tiene el wrapper
			response.data = normalize(data);
		}

		return response;
	},
	(error) => {
		const responseData = error.response?.data;
		// Manejar errores envueltos o directos
		const errorObj = responseData?.data || responseData;
		
		if (errorObj?.error) {
			return Promise.reject(new Error(errorObj.error));
		}
		if (errorObj?.message) {
			const msg = Array.isArray(errorObj.message)
				? errorObj.message.join(", ")
				: errorObj.message;
			return Promise.reject(new Error(msg));
		}
		return Promise.reject(new Error(error.message || "Error de conexión"));
	},
);
