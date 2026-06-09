/**
 * Cédula de identidad ecuatoriana.
 *
 * Reglas:
 *   - Exactamente 10 dígitos numéricos.
 *   - Primeros 2: código de provincia (01-24) o 30 (extranjero).
 *   - Dígito 10: check digit calculado con Módulo 10 sobre los primeros 9.
 *
 * Algoritmo del check digit (Módulo 10):
 *   1. Coeficientes [2,1,2,1,2,1,2,1,2] sobre los primeros 9 dígitos.
 *   2. Si el producto ≥ 10, restar 9.
 *   3. Sumar todos los resultados.
 *   4. check_digit = (10 - (suma % 10)) % 10
 *   5. La cédula es válida si el dígito 10 coincide.
 *
 * Esta función es un espejo de la del back
 * (src/application/common/validators/is-ecuadorian-cedula.validator.ts)
 * para que la validación inline del form le dé feedback al usuario
 * antes de hacer el round-trip al servidor.
 */
export function isValidEcuadorianCedula(cedula: string): boolean {
	if (typeof cedula !== "string") return false;
	if (!/^\d{10}$/.test(cedula)) return false;

	const province = parseInt(cedula.substring(0, 2), 10);
	if (province < 1 || (province > 24 && province !== 30)) return false;

	const digits = cedula.split("").map(Number);
	const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
	let sum = 0;
	for (let i = 0; i < 9; i++) {
		const product = digits[i] * coefficients[i];
		sum += product >= 10 ? product - 9 : product;
	}
	const expectedCheckDigit = (10 - (sum % 10)) % 10;
	return expectedCheckDigit === digits[9];
}
