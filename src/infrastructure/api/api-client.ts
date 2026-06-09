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
	(error) => Promise.reject(error),
);

// Función recursiva para normalizar objetos del dominio
function normalize(obj: unknown): unknown {
	if (Array.isArray(obj)) return obj.map(normalize);
	if (obj === null || typeof obj !== "object" || obj instanceof Date)
		return obj;

	// Evitar procesar objetos que ya son limpios o de librerías
	if ("config" in obj && "headers" in obj && "request" in obj) return obj;

	const result: Record<string, unknown> = {};
	const source = obj as Record<string, unknown>;
	for (const key of Object.keys(source)) {
		let value = source[key];
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
			Object.keys(value as object).length === 1
		) {
			value = (value as { value: unknown }).value;
		}

		result[newKey] = normalize(value);
	}
	return result;
}

// Extraer mensaje de error de forma legible
function extractErrorMessage(errorObj: unknown): string {
	if (!errorObj || typeof errorObj !== "object") return "Error desconocido";
	const e = errorObj as { message?: unknown; error?: unknown };
	if (typeof e.message === "string") return e.message;
	if (Array.isArray(e.message)) return e.message.join(", ");
	if (typeof e.error === "string") return e.error;
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
			"success" in data &&
			(data as { success?: unknown }).success === true &&
			"data" in data
		) {
			// Solo normalizar el payload interno, NO re-estructurar response.data
			// así extractPayload en el repository puede hacer su trabajo correctamente
			(data as { data: unknown }).data = normalize(
				(data as { data: unknown }).data,
			);
		} else {
			// Si no tiene wrapper, normalizar como está (respuestas sin wrapper)
			response.data = normalize(data);
		}

		return response;
	},
	(error: AxiosError) => {
		const responseData = error.response?.data as
			| Record<string, unknown>
			| undefined;
		const statusCode = error.response?.status || 500;

		let errorMessage = "Error de conexión";

		if (responseData) {
			// Intentar extraer del wrapper de NestJS
			const errorPayload = responseData.data || responseData;
			errorMessage = extractErrorMessage(errorPayload);
		} else if (error.message) {
			errorMessage = error.message;
		}

		// Mensajes específicos por código de aplicación (definidos por el backend en BusinessException)
		const responseCode =
			(responseData as { code?: unknown } | undefined)?.code ??
			(responseData as { data?: { code?: unknown } } | undefined)?.data?.code;
		if (statusCode === 400 && responseCode === "ACCOUNT_BLOCKED") {
			errorMessage =
				"Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.";
		}

		// Contexto por código HTTP
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
	},
);
