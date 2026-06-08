/**
 * Locale-aware currency formatting helpers.
 * Single source of truth for currency rendering across the frontend.
 */

const arsFormatter = new Intl.NumberFormat("es-AR", {
	style: "currency",
	currency: "ARS",
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

export const formatCurrency = (value: number | null | undefined): string => {
	if (value === null || value === undefined || Number.isNaN(value)) return "$0";
	return arsFormatter.format(value);
};
