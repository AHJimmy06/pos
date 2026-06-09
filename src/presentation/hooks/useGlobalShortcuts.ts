import { useEffect, useRef } from "react";

/**
 * Hook that registers a small set of global keyboard shortcuts.
 *
 * Scope rules:
 *   - Single-key shortcuts (`?`, `/`, `g`, `Esc`, etc.) are NOT fired when
 *     the event target is a text-editing element (input, textarea, select,
 *     contenteditable). This avoids hijacking normal typing.
 *   - Combo shortcuts (Ctrl+Enter, Ctrl+S, Ctrl+K) are always evaluated
 *     against `e.ctrlKey` / `e.metaKey` and fire regardless of focus.
 *
 * Sequences (vim-style `g h`, `g p`, ...):
 *   The hook keeps a small buffer; if the second key isn't pressed within
 *   `sequenceTimeoutMs` (default 1200ms) the buffer resets.
 */
type GlobalShortcutsOptions = {
	onOpenHelp: () => void;
	onNavigate: (path: string) => void;
	isAdmin: boolean;
	sequenceTimeoutMs?: number;
};

const isTextEditingElement = (el: EventTarget | null): boolean => {
	if (!(el instanceof HTMLElement)) return false;
	const tag = el.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
	if (el.isContentEditable) return true;
	return false;
};

const focusFirstSearchInput = (): boolean => {
	const candidates = document.querySelectorAll<HTMLElement>(
		'input[type="search"], [data-search-input]',
	);
	for (const el of Array.from(candidates)) {
		if (el.offsetParent !== null) {
			el.focus();
			return true;
		}
	}
	// Fallback: first visible text-like input on the page
	const all = document.querySelectorAll<HTMLElement>("input");
	for (const el of Array.from(all)) {
		const type = (el as HTMLInputElement).type;
		if (
			el.offsetParent !== null &&
			type !== "hidden" &&
			type !== "checkbox" &&
			type !== "radio"
		) {
			el.focus();
			return true;
		}
	}
	return false;
};

export const useGlobalShortcuts = ({
	onOpenHelp,
	onNavigate,
	isAdmin,
	sequenceTimeoutMs = 1200,
}: GlobalShortcutsOptions): void => {
	const sequenceBufferRef = useRef<{ key: string; ts: number } | null>(null);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const inTextField = isTextEditingElement(e.target);

			// ── Combos (always evaluated) ────────────────────────────────────
			if ((e.ctrlKey || e.metaKey) && !e.altKey) {
				const k = e.key.toLowerCase();
				// Ctrl+Enter: surface as a custom event the POS page listens for
				if (k === "enter") {
					window.dispatchEvent(new CustomEvent("pos:confirm-sale"));
					e.preventDefault();
					return;
				}
				if (k === "s") {
					window.dispatchEvent(new CustomEvent("pos:save-form"));
					e.preventDefault();
					return;
				}
				if (k === "b") {
					window.dispatchEvent(new CustomEvent("pos:open-product-search"));
					e.preventDefault();
					return;
				}
				if (k === "l") {
					window.dispatchEvent(new CustomEvent("pos:open-client-search"));
					e.preventDefault();
					return;
				}
				return; // any other ctrl-combo: let the browser handle it
			}

			// From here on, only single keys (no Ctrl/Meta/Alt modifiers)
			if (e.ctrlKey || e.metaKey || e.altKey) return;

			// ── Esc — close the help modal (always, even in text fields) ─────
			if (e.key === "Escape") {
				window.dispatchEvent(new CustomEvent("app:escape-pressed"));
				return;
			}

			// ── Don't hijack typing in text fields for single-key shortcuts ──
			if (inTextField) return;

			// ── ? — open help ────────────────────────────────────────────────
			if (e.key === "?") {
				e.preventDefault();
				onOpenHelp();
				return;
			}

			// ── / — focus search ─────────────────────────────────────────────
			if (e.key === "/") {
				if (focusFirstSearchInput()) {
					e.preventDefault();
				}
				return;
			}

			// ── g + <letter> — go to route ───────────────────────────────────
			if (e.key === "g") {
				sequenceBufferRef.current = { key: "g", ts: Date.now() };
				return;
			}
			const buf = sequenceBufferRef.current;
			if (buf && buf.key === "g" && Date.now() - buf.ts <= sequenceTimeoutMs) {
				const map: Record<string, string> = {
					h: "/pos",
					p: "/products",
					c: "/clients",
					i: "/invoices",
				};
				const target = map[e.key.toLowerCase()];
				if (target) {
					e.preventDefault();
					onNavigate(target);
					sequenceBufferRef.current = null;
					return;
				}
				if (e.key.toLowerCase() === "r" && isAdmin) {
					e.preventDefault();
					onNavigate("/logs/errors");
					sequenceBufferRef.current = null;
					return;
				}
				// unrecognized second key: drop the buffer
				sequenceBufferRef.current = null;
				return;
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onOpenHelp, onNavigate, isAdmin, sequenceTimeoutMs]);
};
