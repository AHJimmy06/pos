import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Loader2,
	ChevronLeft,
	ChevronRight,
	AlertTriangle,
	XCircle,
} from "lucide-react";

interface ErrorLog {
	id: number;
	message: string;
	stackTrace?: string | null;
	exceptionType?: string | null;
	userId?: number | null;
	path: string;
	source?: string | null;
	createdAt: string;
}

interface ErrorLogsResponse {
	data: ErrorLog[];
	total: number;
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30] as const;

const truncate = (value: string | null | undefined, max = 80): string => {
	if (!value) return "—";
	if (value.length <= max) return value;
	return `${value.slice(0, max - 1)}…`;
};

const formatDate = (dateStr: string): string =>
	new Date(dateStr).toLocaleString("es-AR", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});

export const ErrorLogsPage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState<number>(10);
	const [pathSearch, setPathSearch] = useState("");
	const [currentPageInput, setCurrentPageInput] = useState("");

	const { data, isLoading, isError, error } = useQuery<ErrorLogsResponse>({
		queryKey: ["error-logs", { page, limit }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			const res = await apiClient.get<ErrorLogsResponse>(
				`/users/logs/errors?${params.toString()}`,
			);
			// interceptor now preserves NestJS wrapper in res.data
			const payload = (res.data as { data?: unknown }).data;
			if (payload && typeof payload === "object" && "data" in payload) {
				return payload as ErrorLogsResponse;
			}
			return { data: [], total: 0 };
		},
	});

	const logs: ErrorLog[] = data?.data ?? [];
	const total: number = data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	const visibleLogs = pathSearch
		? logs.filter(
				(l) =>
					l.path.toLowerCase().includes(pathSearch.toLowerCase()) ||
					l.message.toLowerCase().includes(pathSearch.toLowerCase()),
			)
		: logs;

	const getVisiblePages = () => {
		const list: (number | "...")[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) list.push(i);
			return list;
		}
		list.push(1);
		if (page > 3) list.push("...");
		for (
			let i = Math.max(2, page - 1);
			i <= Math.min(totalPages - 1, page + 1);
			i++
		) {
			list.push(i);
		}
		if (page < totalPages - 2) list.push("...");
		list.push(totalPages);
		return list;
	};

	const handlePageInputSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const pageNum = parseInt(currentPageInput, 10);
		if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
			setPage(pageNum);
		}
		setCurrentPageInput("");
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="bg-destructive p-2 rounded-lg text-destructive-foreground">
					<AlertTriangle className="size-5" />
				</div>
				<div>
					<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
						Logs de Errores
					</h1>
					<p className="text-muted-foreground">
						Registro de errores del sistema para soporte técnico
					</p>
				</div>
			</div>

			{/* Filters */}
			<Card className="border-none shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Errores Registrados ({total})
						</CardTitle>
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Mostrar</span>
							<select
								value={limit}
								onChange={(e) => {
									setLimit(Number(e.target.value));
									setPage(1);
								}}
								className="h-8 px-2 rounded border border-input bg-background text-sm font-bold w-16 text-center"
							>
								{PAGE_SIZE_OPTIONS.map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
							<span className="text-sm text-muted-foreground">por página</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder="Filtrar por path o mensaje..."
							value={pathSearch}
							onChange={(e) => setPathSearch(e.target.value)}
							className="max-w-md"
						/>
					</div>

					{isLoading ? (
						<div className="h-[300px] flex items-center justify-center">
							<Loader2 className="size-8 animate-spin text-primary" />
						</div>
					) : isError ? (
						<div className="h-[300px] flex flex-col items-center justify-center text-destructive">
							<XCircle className="size-8 mb-2" />
							<p className="font-bold">Error al cargar logs</p>
							<p className="text-sm">{(error as Error).message}</p>
						</div>
					) : (
						<div className="relative overflow-x-auto rounded-xl border border-border/50">
							<table className="w-full text-sm text-left">
								<thead className="text-xs text-muted-foreground uppercase bg-muted/30">
									<tr>
										<th className="px-4 py-3 font-black">ID</th>
										<th className="px-4 py-3 font-black">Fecha</th>
										<th className="px-4 py-3 font-black">Tipo</th>
										<th className="px-4 py-3 font-black">Path</th>
										<th className="px-4 py-3 font-black">Mensaje</th>
										<th className="px-4 py-3 font-black text-center">
											Usuario
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/50">
									{visibleLogs.map((log) => (
										<tr
											key={log.id}
											className="bg-transparent hover:bg-muted/20"
										>
											<td className="px-4 py-3 font-mono text-muted-foreground">
												#{log.id}
											</td>
											<td className="px-4 py-3 text-xs">
												{formatDate(log.createdAt)}
											</td>
											<td className="px-4 py-3">
												{log.exceptionType ? (
													<Badge variant="destructive" className="text-[10px]">
														{log.exceptionType}
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">
														—
													</span>
												)}
											</td>
											<td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate">
												{log.path}
											</td>
											<td
												className="px-4 py-3 max-w-[400px]"
												title={log.message}
											>
												{truncate(log.message, 80)}
											</td>
											<td className="px-4 py-3 text-center text-xs">
												{log.userId ?? "—"}
											</td>
										</tr>
									))}
									{visibleLogs.length === 0 && (
										<tr>
											<td
												colSpan={6}
												className="px-4 py-10 text-center text-muted-foreground"
											>
												No hay errores registrados
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex flex-wrap items-center justify-between mt-4 pt-4 gap-4">
							<p className="text-sm text-muted-foreground">
								Página {page} de {totalPages} ({total} errores)
							</p>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									<ChevronLeft className="size-4" />
								</Button>
								<div className="flex items-center gap-1">
									{getVisiblePages().map((p, idx) =>
										p === "..." ? (
											<span
												key={`e-${idx}`}
												className="px-2 text-muted-foreground"
											>
												…
											</span>
										) : (
											<Button
												key={p}
												variant={page === p ? "default" : "ghost"}
												size="sm"
												onClick={() => setPage(p)}
												className="w-9"
											>
												{p}
											</Button>
										),
									)}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									<ChevronRight className="size-4" />
								</Button>
								<div className="h-8 w-px bg-border mx-1" />
								<form
									onSubmit={handlePageInputSubmit}
									className="flex items-center gap-1"
								>
									<Input
										type="number"
										min={1}
										max={totalPages}
										placeholder="Pg"
										value={currentPageInput}
										onChange={(e) => setCurrentPageInput(e.target.value)}
										className="w-16 h-8 text-center"
									/>
									<Button type="submit" variant="secondary" size="sm">
										Ir
									</Button>
								</form>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
