import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./presentation/context/AuthContext";
import { ApplicationProvider } from "./presentation/context/application-provider";
import { ProtectedRoute } from "./presentation/components/ProtectedRoute";
import { AppLayout } from "./presentation/components/AppLayout";

// Páginas
import { LoginPage } from "./presentation/pages/LoginPage";
import { POSPage } from "./presentation/pages/POSPage";
import { ProductsPage } from "./presentation/pages/ProductsPage";
import { UsersPage } from "./presentation/pages/UsersPage";
import { ClientsPage } from "./presentation/pages/ClientsPage";
import { TaxesPage } from "./presentation/pages/TaxesPage";
import { InvoicesPage } from "./presentation/pages/InvoicesPage";
import { AuditSalesPage } from "./presentation/pages/AuditSalesPage";

import "./index.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

function App() {
	return (
		<AuthProvider>
			<ApplicationProvider>
				<QueryClientProvider client={queryClient}>
					<BrowserRouter>
						<Routes>
							{/* Ruta Pública: Login */}
							<Route path="/login" element={<LoginPage />} />

							{/* Rutas Privadas: App Layout */}
							<Route
								path="/"
								element={
									<ProtectedRoute>
										<AppLayout />
									</ProtectedRoute>
								}
							>
								{/* Redirección inicial según rol podría hacerse en un componente Home */}
								<Route index element={<Navigate to="/pos" replace />} />

								<Route path="pos" element={<POSPage />} />

								<Route
									path="products"
									element={
										<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}>
											<ProductsPage />
										</ProtectedRoute>
									}
								/>

								<Route
									path="users"
									element={
										<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}>
											<UsersPage />
										</ProtectedRoute>
									}
								/>

								<Route path="clients" element={<ClientsPage />} />
					<Route path="invoices" element={<InvoicesPage />} />
					<Route
						path="audit/sales"
						element={
							<ProtectedRoute allowedRoles={["ADMINISTRATOR", "AUDITOR"]}>
								<AuditSalesPage />
							</ProtectedRoute>
						}
					/>
					<Route path="taxes" element={<TaxesPage />} />
					<Route
									path="settings"
									element={
										<div className="p-8 text-center font-bold">
											Configuración (En desarrollo)
										</div>
									}
								/>
							</Route>

							{/* Ruta para No Autorizado */}
							<Route
								path="/unauthorized"
								element={
									<div className="min-h-screen flex flex-col items-center justify-center gap-4">
										<h1 className="text-4xl font-black text-destructive uppercase">
											No Autorizado
										</h1>
										<p className="text-muted-foreground">
											No tienes permisos para acceder a esta sección.
										</p>
										<button
											onClick={() => (window.location.href = "/")}
											className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
										>
											Volver al Inicio
										</button>
									</div>
								}
							/>

							{/* Fallback para 404 */}
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</BrowserRouter>
				</QueryClientProvider>
			</ApplicationProvider>
		</AuthProvider>
	);
}

export default App;
