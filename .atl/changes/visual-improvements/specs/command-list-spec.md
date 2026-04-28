# Spec: Command List Height Fix

## Background
The CommandList component has a max-height constraint that overrides explicit settings in ProductGrid, causing content to be cut off.

## Scenarios

### Scenario: Product list displays up to 400px height
- **Given** the product selector popover is open
- **When** there are many products
- **Then** the list should scroll after reaching 400px height
- **And** all products should remain accessible via scrolling

### Scenario: Command items have proper spacing
- **Given** the CommandList is displayed
- **When** items are rendered
- **Then** each item should have adequate padding (py-3 / px-4)
- **And** selected items should have visible selection state

## Requirements
- CommandList max-height must respect inline style overrides
- Default max-height should be 400px (matching ProductGrid's explicit setting)
- Product items must display full content without truncation