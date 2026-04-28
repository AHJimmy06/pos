# Proposal: Visual Improvements for POS Interface

## Problem Statement
The POS interface has several visual issues affecting user experience:
1. Client selector and product selector popovers appear without proper animation and are too small when opened
2. The PDF template used in InvoiceHistory bypasses the beautiful serif InvoicePDF component
3. Empty states and general polish don't match the reference implementation (pos2)

## Capabilities
- **Popover Sizing & Animation**: Fix CSS variable for trigger width, ensure smooth animations
- **Command List Height**: Correct max-height constraint for product selector
- **PDF Template Consistency**: Use InvoicePDF component for all print operations
- **Empty State Polish**: Match pos2's refined empty state styling
- **General Polish**: Improve shadows, spacing, hover states across components

## Scope
### In Scope
- `src/components/ui/popover.tsx` - Fix sizing CSS variable
- `src/components/ui/command.tsx` - Fix max-height constraint
- `src/presentation/components/ClientSelector.tsx` - Polish styling
- `src/presentation/components/ProductGrid.tsx` - Polish styling
- `src/presentation/components/InvoicePDF.tsx` - Ensure serif template is used
- `src/presentation/components/InvoiceHistory.tsx` - Use InvoicePDF for print
- `src/presentation/components/CartSidebar.tsx` - Polish empty state
- `src/index.css` - Add missing CSS variables and animations

### Out of Scope
- No changes to business logic
- No changes to API or data layer

## Success Criteria
- Popovers animate smoothly with proper size matching trigger width
- Command lists display up to 400px height without cutting off content
- All PDF printing uses the InvoicePDF serif template
- Empty states display with polished visual hierarchy
- Overall UI matches the refined pos2 styling quality

## Risk Assessment
- **Risk**: Low - purely visual/CSS changes
- **Impact**: Improves UX without affecting functionality
- **Rollback**: Easy - revert CSS changes