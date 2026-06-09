/**
 * Keyboard shortcuts catalog for the POS help modal.
 * The `scope` field is informational (used to group rows in the table).
 * Actual handling lives in `useGlobalShortcuts` and per-page effects.
 */
export type ShortcutScope = "global" | "list" | "form" | "modal";

export type Shortcut = {
	action: string;
	keys: string[];
	description: string;
	scope: ShortcutScope;
};

export const SHORTCUTS: Shortcut[] = [
	// ── Globales ────────────────────────────────────────────────────────────
	{
		action: "Abrir ayuda",
		keys: ["?"],
		description: "Muestra este modal con atajos y guía de uso.",
		scope: "global",
	},
	{
		action: "Cerrar modal / panel",
		keys: ["Esc"],
		description: "Cierra cualquier modal o panel abierto.",
		scope: "global",
	},
	{
		action: "Enfocar búsqueda",
		keys: ["/"],
		description: "Mueve el cursor al input de búsqueda de la pantalla actual.",
		scope: "global",
	},
	{
		action: "Ir a inicio (POS)",
		keys: ["g", "h"],
		description: "Navega a la pantalla de Punto de Venta.",
		scope: "global",
	},
	{
		action: "Ir a Productos",
		keys: ["g", "p"],
		description: "Navega al listado de productos.",
		scope: "global",
	},
	{
		action: "Ir a Clientes",
		keys: ["g", "c"],
		description: "Navega al listado de clientes.",
		scope: "global",
	},
	{
		action: "Ir a Ventas",
		keys: ["g", "i"],
		description: "Navega al historial de facturas.",
		scope: "global",
	},
	{
		action: "Ir a Reportes",
		keys: ["g", "r"],
		description: "Navega al log de errores (solo administradores).",
		scope: "global",
	},

	// ── En listados ────────────────────────────────────────────────────────
	{
		action: "Siguiente fila",
		keys: ["j"],
		description: "Mueve la selección a la fila siguiente de la tabla.",
		scope: "list",
	},
	{
		action: "Fila anterior",
		keys: ["k"],
		description: "Mueve la selección a la fila anterior de la tabla.",
		scope: "list",
	},
	{
		action: "Abrir detalle",
		keys: ["Enter"],
		description: "Abre el detalle de la fila seleccionada.",
		scope: "list",
	},
	{
		action: "Nuevo registro",
		keys: ["n"],
		description: "Abre el formulario para crear un nuevo registro.",
		scope: "list",
	},
	{
		action: "Editar selección",
		keys: ["e"],
		description: "Abre el formulario de edición de la fila seleccionada.",
		scope: "list",
	},

	// ── En formularios ─────────────────────────────────────────────────────
	{
		action: "Siguiente campo",
		keys: ["Tab"],
		description: "Mueve el foco al siguiente campo del formulario.",
		scope: "form",
	},
	{
		action: "Campo anterior",
		keys: ["Shift", "Tab"],
		description: "Mueve el foco al campo anterior del formulario.",
		scope: "form",
	},
	{
		action: "Enviar formulario",
		keys: ["Enter"],
		description: "Envía (submit) el formulario activo.",
		scope: "form",
	},
	{
		action: "Cancelar",
		keys: ["Esc"],
		description: "Cancela la operación y cierra el formulario.",
		scope: "form",
	},
	{
		action: "Guardar",
		keys: ["Ctrl", "S"],
		description: "Atajo de teclado para guardar cambios en formularios largos.",
		scope: "form",
	},

	// ── En Punto de Venta ──────────────────────────────────────────────────
	{
		action: "Confirmar venta",
		keys: ["Ctrl", "Enter"],
		description: "Confirma la venta en curso desde la pantalla POS.",
		scope: "form",
	},
	{
		action: "Buscar producto",
		keys: ["Ctrl", "B"],
		description: "Abre el buscador modal de productos en el POS.",
		scope: "form",
	},
	{
		action: "Buscar cliente",
		keys: ["Ctrl", "L"],
		description: "Abre el buscador modal de clientes en el POS.",
		scope: "form",
	},

	// ── En este modal ──────────────────────────────────────────────────────
	{
		action: "Ir a tab 'Atajos'",
		keys: ["1"],
		description: "Cambia a la pestaña de atajos de teclado.",
		scope: "modal",
	},
	{
		action: "Ir a tab 'Guía'",
		keys: ["2"],
		description: "Cambia a la pestaña de guía de uso.",
		scope: "modal",
	},
];
