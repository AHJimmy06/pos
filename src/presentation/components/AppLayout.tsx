import React, { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useGlobalShortcuts } from "../hooks/useGlobalShortcuts";
import { HelpModal } from "./HelpModal";
import { HelpButton } from "./HelpButton";

export const AppLayout: React.FC = () => {
	const [helpOpen, setHelpOpen] = useState(false);
	const navigate = useNavigate();
	const { user } = useAuth();
	const isAdmin = user?.role === "ADMINISTRATOR";

	const handleOpenHelp = useCallback(() => setHelpOpen(true), []);
	const handleNavigate = useCallback(
		(path: string) => navigate(path),
		[navigate],
	);

	useGlobalShortcuts({
		onOpenHelp: handleOpenHelp,
		onNavigate: handleNavigate,
		isAdmin,
	});

	return (
		<div className="flex min-h-screen bg-muted/20">
			<a href="#main-content" className="skip-link">
				Saltar al contenido principal
			</a>
			<Sidebar />
			<main
				id="main-content"
				className="flex-1 flex flex-col min-w-0"
				tabIndex={-1}
			>
				<div className="flex-1 p-6 md:p-8">
					<Outlet />
				</div>
			</main>
			<HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
			<HelpButton onClick={() => setHelpOpen(true)} />
		</div>
	);
};
