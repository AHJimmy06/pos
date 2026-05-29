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

export const useDashboardStats = () => {
	const statsQuery = useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: async () => {
			const res = await apiClient.get("/dashboard/stats");
			return res as unknown as DashboardStats;
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
