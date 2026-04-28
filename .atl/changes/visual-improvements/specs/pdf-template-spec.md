# Spec: PDF Template Consistency

## Background
InvoiceHistory currently uses a basic system-ui print template for printing invoices, bypassing the beautiful serif InvoicePDF component that should be used for all PDF generation.

## Scenarios

### Scenario: InvoiceHistory uses InvoicePDF for printing
- **Given** the user clicks the print button on an invoice in history
- **When** the print dialog opens
- **Then** it should use the InvoicePDF serif template
- **And** the styling should match the live invoice PDF

### Scenario: InvoicePDF has professional serif styling
- **Given** the InvoicePDF component is rendered
- **When** it is printed or previewed
- **Then** it should use a serif font family
- **And** it should have proper spacing, borders, and visual hierarchy

### Scenario: All print paths use consistent template
- **Given** any print action is triggered (CartSidebar or InvoiceHistory)
- **When** the print content is generated
- **Then** all paths should use the same InvoicePDF component

## Requirements
- Refactor InvoiceHistory.printInvoice to use InvoicePDF via react-to-print or similar
- Ensure InvoicePDF has complete styling with all invoice fields
- Maintain print-specific CSS for A4 formatting