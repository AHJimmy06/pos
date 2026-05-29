import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface TopProduct {
	productId: number;
	productName: string;
	quantitySold: number;
	totalRevenue: number;
}

export interface SalesByDay {
	date: string;
	total: number;
	count: number;
}

export interface DashboardStats {
	totalProducts: number;
	totalClients: number;
	totalInvoices: number;
	totalSales: number;
	topProducts: TopProduct[];
	salesByDay: SalesByDay[];
}

// Helper para extraer payload de respuestas NestJS
function getPayload<T>(response: unknown): T | null {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res = response as any;
	const data = res?.data;

	if (!data) return null;

	// Si tiene estructura NestJS wrapper { success, data: ... }
	if (data.success !== undefined && data.data !== undefined) {
		const inner = data.data;
		// Si es paginado
		if (
			inner &&
			typeof inner === "object" &&
			"data" in inner &&
			"total" in inner
		) {
			return inner as T;
		}
		// Si es simple
		return inner as T;
	}

	// Si no tiene wrapper
	return data as T;
}

export const useDashboardStats = () => {
	const statsQuery = useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: async () => {
			const res = await apiClient.get("/dashboard/stats");
			const payload = getPayload<DashboardStats>(res);
			if (!payload) return null;
			return payload;
		},
	});

	return {
		stats: statsQuery.data ?? {
			totalProducts: 0,
			totalClients: 0,
			totalInvoices: 0,
			totalSales: 0,
			topProducts: [],
			salesByDay: [],
		},
		isLoading: statsQuery.isLoading,
	};
};
