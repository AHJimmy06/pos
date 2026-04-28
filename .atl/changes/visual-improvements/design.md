# Design: Visual Improvements for POS Interface

## Overview
This change addresses visual styling issues in the POS interface, focusing on popover behavior, command list sizing, PDF template consistency, and empty state polish.

## Technical Decisions

### 1. Popover Sizing Fix
**Problem**: `w-[var(--base-ui-popover-trigger-width)]` uses undefined CSS variable
**Solution**: 
- Remove the CSS variable dependency
- Use `w-full min-w-[320px]` for consistent minimum width
- Keep `w-[var(--base-ui-popover-trigger-width)]` only if explicitly set via inline style from trigger

**File**: `src/components/ui/popover.tsx`

### 2. Animation State Detection
**Problem**: Using `data-[open=true]` instead of proper state attribute
**Solution**:
- Use `data-[state=open]` which is what base-ui emits
- Ensure animation classes `animate-in fade-in zoom-in-95` are applied

**Files**: `popover.tsx`, `ClientSelector.tsx`, `ProductGrid.tsx`

### 3. Command List Height
**Problem**: `command.tsx` has `max-h-72` hardcoded
**Solution**:
- Change default to `max-h-[400px]` 
- Allow parent overrides via className

**File**: `src/components/ui/command.tsx`

### 4. PDF Template via react-to-print
**Problem**: InvoiceHistory opens plain window with system-ui font
**Solution**:
- Import InvoicePDF and use react-to-print pattern from CartSidebar
- Create a reusable print mechanism
- Maintain InvoicePDF ref pattern for hidden rendering

**File**: `src/presentation/components/InvoiceHistory.tsx`

### 5. Empty State Styling
**Problem**: Missing visual polish compared to pos2
**Solution**:
- Add circular background containers
- Use emoji icons (🛒 for cart, 📋 for history)
- Apply proper text hierarchy with uppercase tracking

**Files**: `CartSidebar.tsx`, `InvoiceHistory.tsx`

## CSS Changes

### index.css additions:
```css
/* Popover trigger width variable - set dynamically via JS */
:root {
  --base-ui-popover-trigger-width: 100%;
}
```

### Animation utilities (if not present):
```css
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoom-in-95 { from { transform: scale(0.95); } to { transform: scale(1); } }
.animate-in { animation: fade-in 0.2s ease-out, zoom-in-95 0.2s ease-out; }
```

## File Changes Summary

| File | Changes |
|------|---------|
| `src/index.css` | Add --base-ui-popover-trigger-width variable |
| `src/components/ui/popover.tsx` | Fix animation state, sizing |
| `src/components/ui/command.tsx` | Fix max-height default |
| `src/presentation/components/ClientSelector.tsx` | Polish trigger styling |
| `src/presentation/components/ProductGrid.tsx` | Polish trigger styling |
| `src/presentation/components/InvoicePDF.tsx` | Ensure completeness |
| `src/presentation/components/InvoiceHistory.tsx` | Use InvoicePDF for print |
| `src/presentation/components/CartSidebar.tsx` | Polish empty state |

## Dependencies
- No new dependencies required
- `tw-animate-css` already imported in index.css
- `react-to-print` already available via CartSidebar