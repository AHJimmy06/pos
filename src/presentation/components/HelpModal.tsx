import React, { useEffect, useId, useState } from "react";
import { Keyboard } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { SHORTCUTS, type ShortcutScope } from "@/data/shortcuts";
import { GUIDE } from "@/data/guide";
import { cn } from "@/lib/utils";

interface HelpModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const SCOPE_LABELS: Record<ShortcutScope, string> = {
	global: "Global",
	list: "Listados",
	form: "Formularios / POS",
	modal: "Este modal",
};

const SCOPE_ORDER: ShortcutScope[] = ["global", "list", "form", "modal"];

/**
 * Tiny ARIA-correct Tabs implementation. We don't pull in @radix-ui/react-tabs
 * to keep the dependency surface minimal.
 */
const Tabs: React.FC<{
	value: "shortcuts" | "guide";
	onValueChange: (v: "shortcuts" | "guide") => void;
	children: React.ReactNode;
}> = ({ value, onValueChange, children }) => {
	return (
		<div className="flex flex-col gap-4">
			<div
				role="tablist"
				aria-label="Secciones de ayuda"
				className="inline-flex h-10 w-fit items-center justify-center rounded-lg bg-muted p-1"
			>
				<TabTrigger
					active={value === "shortcuts"}
					onSelect={() => onValueChange("shortcuts")}
					value="shortcuts"
				>
					<Keyboard className="mr-2 size-3.5" />
					Atajos de teclado
				</TabTrigger>
				<TabTrigger
					active={value === "guide"}
					onSelect={() => onValueChange("guide")}
					value="guide"
				>
					Guía de uso
				</TabTrigger>
			</div>
			{children}
		</div>
	);
};

const TabTrigger: React.FC<{
	active: boolean;
	onSelect: () => void;
	value: string;
	children: React.ReactNode;
}> = ({ active, onSelect, value, children }) => {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={active}
			aria-controls={`tab-panel-${value}`}
			id={`tab-${value}`}
			tabIndex={active ? 0 : -1}
			onClick={onSelect}
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
				active
					? "bg-background text-foreground shadow-sm"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			{children}
		</button>
	);
};

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<kbd className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded shadow-sm">
		{children}
	</kbd>
);

const ShortcutRow: React.FC<{ shortcut: (typeof SHORTCUTS)[number] }> = ({
	shortcut,
}) => (
	<tr className="border-b border-border/40 last:border-b-0">
		<td className="px-4 py-2.5 font-medium text-foreground">
			{shortcut.action}
		</td>
		<td className="px-4 py-2.5">
			<div className="flex flex-wrap items-center gap-1">
				{shortcut.keys.map((k, i) => (
					<React.Fragment key={`${shortcut.action}-${i}`}>
						{i > 0 && <span className="text-muted-foreground text-xs">+</span>}
						<Kbd>{k}</Kbd>
					</React.Fragment>
				))}
			</div>
		</td>
		<td className="px-4 py-2.5 text-muted-foreground">
			{shortcut.description}
		</td>
	</tr>
);

export const HelpModal: React.FC<HelpModalProps> = ({ open, onOpenChange }) => {
	const [tab, setTab] = useState<"shortcuts" | "guide">("shortcuts");
	const [lastOpen, setLastOpen] = useState(open);
	const titleId = useId();
	const descId = useId();

	// Reset to the first tab every time the modal opens, so the user always
	// lands on the most-likely-wanted view (shortcuts). Se hace durante
	// render (no en useEffect) para evitar cascading renders.
	if (lastOpen !== open) {
		setLastOpen(open);
		if (open) setTab("shortcuts");
	}

	// In-modal keyboard handling: `1` / `2` to switch tabs, `Esc` closes.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (e.key === "1") {
				e.preventDefault();
				setTab("shortcuts");
			} else if (e.key === "2") {
				e.preventDefault();
				setTab("guide");
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	// Group shortcuts by scope for the table.
	const grouped = SCOPE_ORDER.map((scope) => ({
		scope,
		items: SHORTCUTS.filter((s) => s.scope === scope),
	})).filter((g) => g.items.length > 0);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				aria-labelledby={titleId}
				aria-describedby={descId}
				className="max-w-3xl"
			>
				<DialogHeader>
					<DialogTitle id={titleId} className="text-xl">
						Centro de ayuda
					</DialogTitle>
					<DialogDescription id={descId}>
						Atajos de teclado para manejar la app sin mouse, y guía rápida de
						cada pantalla. Apretá <Kbd>?</Kbd> en cualquier momento para volver
						a abrir este modal.
					</DialogDescription>
				</DialogHeader>

				<Tabs value={tab} onValueChange={setTab}>
					<div
						role="tabpanel"
						id="tab-panel-shortcuts"
						aria-labelledby="tab-shortcuts"
						hidden={tab !== "shortcuts"}
					>
						{tab === "shortcuts" && (
							<div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border/50">
								{grouped.map(({ scope, items }) => (
									<div
										key={scope}
										className="border-b border-border/40 last:border-b-0"
									>
										<div className="px-4 py-2 bg-muted/30 text-xs font-black uppercase tracking-widest text-muted-foreground">
											{SCOPE_LABELS[scope]}
										</div>
										<table className="w-full text-sm">
											<thead>
												<tr className="text-xs text-muted-foreground">
													<th className="px-4 py-2 text-left font-medium">
														Acción
													</th>
													<th className="px-4 py-2 text-left font-medium">
														Atajo
													</th>
													<th className="px-4 py-2 text-left font-medium">
														Descripción
													</th>
												</tr>
											</thead>
											<tbody>
												{items.map((s) => (
													<ShortcutRow key={s.action} shortcut={s} />
												))}
											</tbody>
										</table>
									</div>
								))}
							</div>
						)}
					</div>

					<div
						role="tabpanel"
						id="tab-panel-guide"
						aria-labelledby="tab-guide"
						hidden={tab !== "guide"}
					>
						{tab === "guide" && (
							<div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
								{GUIDE.map((entry) => (
									<a
										key={entry.path}
										href={entry.path}
										className="block p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
									>
										<div className="flex items-center justify-between mb-1.5">
											<h3 className="font-bold text-foreground">
												{entry.name}
											</h3>
											<Kbd>{entry.path}</Kbd>
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{entry.description}
										</p>
									</a>
								))}
							</div>
						)}
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};
