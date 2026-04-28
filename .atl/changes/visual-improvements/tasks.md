# Tasks: Visual Improvements for POS Interface

## Task 1: Fix Popover Sizing and Animation
- [ ] **1.1**: Update `src/index.css` to set `--base-ui-popover-trigger-width: 100%` in :root
- [ ] **1.2**: Update `src/components/ui/popover.tsx`:
  - Change `data-[open=true]` to `data-[state=open]` for animation states
  - Update popover content className to use `w-full min-w-[320px]`
  - Ensure `animate-in fade-in zoom-in-95` classes are present
- [ ] **1.3**: Update `src/presentation/components/ClientSelector.tsx`:
  - Add `data-[state=open]` attribute to trigger for consistency
- [ ] **1.4**: Update `src/presentation/components/ProductGrid.tsx`:
  - Add `data-[state=open]` attribute to trigger for consistency

## Task 2: Fix Command List Height
- [ ] **2.1**: Update `src/components/ui/command.tsx`:
  - Change `max-h-72` to `max-h-[400px]` in CommandList component
  - Ensure parent className can override max-height

## Task 3: Ensure PDF Template Consistency
- [ ] **3.1**: Update `src/presentation/components/InvoicePDF.tsx`:
  - Add forwardRef for react-to-print compatibility
  - Ensure all fields (transactionId, client details) are rendered
  - Verify serif font and print styling is complete
- [ ] **3.2**: Update `src/presentation/components/InvoiceHistory.tsx`:
  - Import InvoicePDF and useReactToPrint
  - Add componentRef for hidden InvoicePDF rendering
  - Modify handlePrintInvoice to use InvoicePDF via react-to-print
  - Remove basic window.open() print implementation

## Task 4: Polish Empty States
- [ ] **4.1**: Update `src/presentation/components/CartSidebar.tsx`:
  - Improve empty state with circular emoji container (🛒)
  - Add text hierarchy with proper uppercase tracking
  - Ensure vertical centering
- [ ] **4.2**: Update `src/presentation/components/InvoiceHistory.tsx`:
  - Improve empty state with emoji/icon
  - Apply consistent styling with CartSidebar

## Task 5: General Polish
- [ ] **5.1**: Review and improve shadows on Card components if needed
- [ ] **5.2**: Ensure consistent border-radius across components
- [ ] **5.3**: Verify hover states are visible and consistent