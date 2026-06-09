# Frontend Architecture Diagrams (POS)

## Class Diagram (Core Entities & POS Flow)
Este diagrama representa cómo se relacionan las entidades de dominio en el frontend y cómo fluyen los datos hacia la vista de Punto de Venta.

```mermaid
classDiagram
    class Invoice {
        +number id
        +number clientId
        +InvoiceDetail[] details
        +Money subtotal
        +Money taxTotal
        +Money total
        +addDetail(detail)
    }

    class InvoiceDetail {
        +number productId
        +string productName
        +number quantity
        +Money unitPrice
        +TaxRate[] taxes
        +Money subtotal
        +Money total
    }

    class Product {
        +number id
        +string name
        +Money price
        +StockQuantity stock
        +number[] taxIds
        +hasStock() boolean
        +canSell(qty) boolean
    }

    class Client {
        +number id
        +string firstName
        +string lastName
        +string cedula
        +string email
        +fullName() string
    }

    Invoice "1" *-- "many" InvoiceDetail : contains
    InvoiceDetail "many" o-- "1" Product : references
    Invoice "many" o-- "1" Client : belongs to
```

## Sales Flow (POS Sequence)
Describe el proceso desde que se selecciona un producto hasta que se finaliza la venta.

```mermaid
sequenceDiagram
    participant User as Usuario (Cajero)
    participant UI as Componente POS (React)
    participant UC as AddItemToInvoice (UseCase)
    participant Store as POSStore (Zustand)
    participant API as Backend (NestJS)

    User->>UI: Selecciona Producto
    UI->>UC: execute(invoice, product, qty)
    Note over UC: Valida Stock y Reglas de Negocio
    UC-->>UI: Nueva Factura Actualizada
    UI->>Store: setInvoice(updatedInvoice)
    
    User->>UI: Click en "COBRAR"
    UI->>API: POST /invoices (Payload Factura)
    API-->>UI: 201 Created (Factura Persistida)
    UI->>Store: clear()
    UI->>User: Muestra éxito y permite imprimir
```
