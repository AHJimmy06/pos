/**
 * User guide catalog shown in the help modal.
 * Each entry corresponds to a top-level route in the app.
 */
export type GuideEntry = {
	name: string;
	path: string;
	description: string;
};

export const GUIDE: GuideEntry[] = [
	{
		name: "Punto de Venta",
		path: "/pos",
		description:
			"Pantalla principal de facturación. Seleccioná un cliente, agregá productos al carrito y confirmá la venta. La factura se guarda como CONFIRMED y el stock se descuenta automáticamente.",
	},
	{
		name: "Productos",
		path: "/products",
		description:
			"Acá gestionás tu catálogo. Hacé click en 'Nuevo Producto' para agregar uno nuevo, o usá el ícono de lápiz para editar. El stock se descuenta automáticamente al confirmar una venta.",
	},
	{
		name: "Clientes",
		path: "/clients",
		description:
			"Gestioná tu cartera de clientes. La cédula es obligatoria al crear (es ecuatoriana de 10 dígitos con dígito verificador válido). La cédula no se puede modificar después: es write-once por integridad del historial de ventas.",
	},
	{
		name: "Ventas",
		path: "/invoices",
		description:
			"Historial completo de facturas. Filtrá por estado (Borrador, Confirmada, Cancelada) o buscá por ID. Los administradores pueden cancelar facturas confirmadas: el stock se restaura automáticamente.",
	},
	{
		name: "Usuarios",
		path: "/users",
		description:
			"Solo accesible para administradores. Creá usuarios y asignales un rol (Administrador o Vendedor). El usuario bloqueado por 3 intentos fallidos se puede desbloquear desde acá.",
	},
	{
		name: "Impuestos",
		path: "/taxes",
		description:
			"Administrá los impuestos del sistema (IVA 21%, IIBB, percepciones, etc.) y sus tasas. Se asignan a los productos desde su detalle de edición.",
	},
	{
		name: "Reportes de Errores",
		path: "/logs/errors",
		description:
			"Solo accesible para administradores. Muestra el log de errores que la aplicación reporta al backend. Útil para soporte técnico y debugging en producción.",
	},
];
