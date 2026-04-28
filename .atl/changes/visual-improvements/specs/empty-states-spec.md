# Spec: Empty State Polish

## Background
Empty states in CartSidebar and InvoiceHistory lack the visual polish found in pos2's implementation.

## Scenarios

### Scenario: Cart empty state shows "Esperando Items"
- **Given** no items are in the cart
- **When** the CartSidebar renders
- **Then** it should show a centered empty state with:
  - Shopping cart icon (emoji 🛒) in circular muted background
  - Primary text "Esperando Items" in uppercase tracking-widest
  - Secondary text "Seleccioná un cliente y agregá productos"
  - Proper vertical centering

### Scenario: InvoiceHistory empty state
- **Given** no invoices exist
- **When** the InvoiceHistory renders
- **Then** it should show:
  - Centered layout
  - Document emoji or icon
  - "No hay facturas registradas" message

## Requirements
- Empty states must be visually consistent with pos2
- Use circular background containers for icons
- Apply proper typography hierarchy (uppercase, tracking, weight)
- Ensure empty states are vertically centered