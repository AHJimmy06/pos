// DTOs que mapean las respuestas del API de pos-api
// Basado en los DTOs de NestJS en pos-api

// Client DTOs
export interface ClientResponseDto {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	isActive?: boolean;
}

// Product DTOs
export interface ProductResponseDto {
	id: number;
	name: string;
	price: number;
	stock: number;
	taxIds?: number[];
	isActive?: boolean;
	version?: number;
}

// Tax DTOs
export interface TaxResponseDto {
	id: number;
	name: string;
	currentRate: number;
}

// Invoice DTOs
export interface TaxSnapshotDto {
	taxId: number;
	rate: number;
	calculatedAmount: number;
}

export interface InvoiceDetailResponseDto {
	productId: number;
	productName?: string;
	quantity: number;
	unitPriceSnapshot?: number;
	unitPrice?: number;
	detailTaxes?: TaxSnapshotDto[];
	taxes?: TaxSnapshotDto[];
}

export interface InvoiceResponseDto {
	id: number;
	clientId: number;
	userId?: number;
	issueDate: string | Date;
	transactionId: string;
	status?: string;
	paymentMethod?: string;
	details?: InvoiceDetailResponseDto[];
	subtotalSnapshot?: number;
	taxTotalSnapshot?: number;
	totalSnapshot?: number;
	clientNameSnapshot?: string;
	clientEmailSnapshot?: string;
	sellerNameSnapshot?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page?: number;
	limit?: number;
}
