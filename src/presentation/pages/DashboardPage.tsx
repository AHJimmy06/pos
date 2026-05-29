import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package, Users, Receipt, TrendingUp, Loader2 } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

const formatNumber = (value: number): string => {
	return new Intl.NumberFormat("es-CO").format(value);
};

const formatDate = (dateStr: string): string => {
	const date = new Date(dateStr);
	return date.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });
};

export const DashboardPage: React.FC = () => {
	const { stats, isLoading } = useDashboardStats();

	const statsCards = [
		{
			title: "Ventas Totales",
			value: formatCurrency(stats.totalSales),
			icon: TrendingUp,
			color: "text-emerald-500",
			bg: "bg-emerald-500/10",
		},
		{
			title: "Productos",
			value: formatNumber(stats.totalProducts),
			icon: Package,
			color: "text-blue-500",
			bg: "bg-blue-500/10",
		},
		{
			title: "Clientes",
			value: formatNumber(stats.totalClients),
			icon: Users,
			color: "text-violet-500",
			bg: "bg-violet-500/10",
		},
		{
			title: "Facturas",
			value: formatNumber(stats.totalInvoices),
			icon: Receipt,
			color: "text-amber-500",
			bg: "bg-amber-500/10",
		},
	];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[400px]">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	// Calcular el máximo para el gráfico
	const maxSales = Math.max(...stats.salesByDay.map((d) => d.total), 1);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
					Dashboard
				</h1>
				<p className="text-muted-foreground">
					Resumen general del estado del sistema
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsCards.map((stat, i) => (
					<Card key={i} className="border-none shadow-sm overflow-hidden group">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
										{stat.title}
									</p>
									<p className="text-2xl font-black text-foreground">
										{stat.value}
									</p>
								</div>
								<div
									className={`${stat.bg} ${stat.color} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}
								>
									<stat.icon className="size-6" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Gráfico de actividad - últimos 7 días */}
				<Card className="lg:col-span-2 border-none shadow-sm">
					<CardHeader>
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Actividad Reciente (Últimos 7 días)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[280px] flex items-end gap-3 px-4">
							{stats.salesByDay.map((day, i) => {
								const height = maxSales > 0 ? (day.total / maxSales) * 100 : 0;
								const barHeight = Math.max(height, 2);

								return (
									<div
										key={i}
										className="flex-1 flex flex-col items-center justify-end gap-2 h-full"
									>
										{/* Tooltip con valor */}
										<div className="text-xs font-bold text-center whitespace-nowrap">
											{day.total > 0 && formatCurrency(day.total)}
										</div>

										{/* Barra */}
										<div className="relative w-full group flex flex-col items-center justify-end h-[200px]">
											<div
												className="bg-primary rounded-t-lg w-full transition-all duration-500 hover:bg-primary/80 cursor-pointer absolute bottom-0"
												style={{
													height: `${barHeight}%`,
													minHeight: day.total > 0 ? "4px" : "0",
													width: "100%",
												}}
											/>
										</div>

										{/* Fecha */}
										<span className="text-[10px] text-muted-foreground font-medium text-center">
											{formatDate(day.date)}
										</span>
									</div>
								);
							})}
						</div>
						{stats.salesByDay.every((d) => d.total === 0) && (
							<div className="h-[280px] flex items-center justify-center border-2 border-dashed border-muted rounded-xl -mt-[280px]">
								<p className="text-sm text-muted-foreground font-medium italic">
									No hay ventas en los últimos 7 días
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Productos */}
				<Card className="border-none shadow-sm">
					<CardHeader>
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Top Productos
						</CardTitle>
					</CardHeader>
					<CardContent>
						{stats.topProducts.length > 0 ? (
							<div className="space-y-4">
								{stats.topProducts.map((product, i) => (
									<div
										key={i}
										className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
									>
										<div className="size-8 bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
											#{i + 1}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-bold truncate">
												{product.productName}
											</p>
											<p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
												{formatNumber(product.quantitySold)} ventas
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-bold text-primary">
												{formatCurrency(product.totalRevenue)}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="h-[280px] flex items-center justify-center border-2 border-dashed border-muted rounded-xl">
								<p className="text-sm text-muted-foreground font-medium italic">
									No hay datos de ventas
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
