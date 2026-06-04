import axios, { type AxiosError } from "axios";

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
	(error) => Promise.reject(error)
);

// Función recursiva para normalizar objetos del dominio
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(obj: any): any {
	if (Array.isArray(obj)) return obj.map(normalize);
	if (obj === null || typeof obj !== "object" || obj instanceof Date) return obj;

	// Evitar procesar objetos que ya son limpios o de librerías
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

// Extraer mensaje de error de forma legible
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractErrorMessage(errorObj: any): string {
	if (typeof errorObj?.message === "string") {
		return errorObj.message;
	}
	if (Array.isArray(errorObj?.message)) {
		return errorObj.message.join(", ");
	}
	if (typeof errorObj?.error === "string") {
		return errorObj.error;
	}
	return "Error desconocido";
}

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
	(response) => {
		const data = response.data;

		// Respuesta con wrapper de NestJS { success: true, statusCode: 200, data: { ... } }
		if (
			data &&
			typeof data === "object" &&
			data.success === true &&
			"data" in data
		) {
			// Extraer el payload y normalizarlo
			const payload = data.data;
			
			// Si es paginado { data: [...], total: N }
			if (
				payload &&
				typeof payload === "object" &&
				"data" in payload &&
				Array.isArray(payload.data)
			) {
				response.data = {
					data: normalize(payload.data),
					total: payload.total ?? 0,
				};
			} else {
				// Si es un objeto simple
				response.data = normalize(payload);
			}
		} else {
			// Si no tiene wrapper, normalizar como está
			response.data = normalize(data);
		}

		return response;
	},
	(error: AxiosError) => {
		const responseData = error.response?.data as Record<string, unknown> | undefined;
		const statusCode = error.response?.status || 500;

		let errorMessage = "Error de conexión";

		if (responseData) {
			// Intentar extraer del wrapper de NestJS
			const errorPayload = responseData.data || responseData;
			errorMessage = extractErrorMessage(errorPayload);
		} else if (error.message) {
			errorMessage = error.message;
		}

		// Contexto por código de error
		if (statusCode === 401) {
			errorMessage = "No autorizado. Por favor, inicia sesión de nuevo.";
			localStorage.removeItem("pos_token");
			localStorage.removeItem("pos_user");
		} else if (statusCode === 403) {
			errorMessage = "No tienes permisos para realizar esta acción.";
		} else if (statusCode === 404) {
			errorMessage = "Recurso no encontrado.";
		} else if (statusCode === 422) {
			errorMessage = "Datos inválidos. Por favor, verifica el formulario.";
		} else if (statusCode >= 500) {
			errorMessage = "Error del servidor. Por favor, intenta más tarde.";
		}

		console.error("API Error:", {
			status: statusCode,
			message: errorMessage,
			details: responseData,
		});

		return Promise.reject(new Error(errorMessage));
	}
);