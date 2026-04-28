# Spec: Popover Sizing and Animation Fix

## Background
The popover components (ClientSelector and ProductGrid) appear without animation and are incorrectly sized due to a missing CSS variable.

## Scenarios

### Scenario: Popover opens with smooth animation
- **Given** the user clicks on ClientSelector or ProductGrid trigger
- **When** the popover opens
- **Then** it should animate in with a fade + scale effect (200ms)
- **And** the width should match the trigger element width

### Scenario: Popover closes with smooth animation
- **Given** a popover is open
- **When** the user clicks outside or presses Escape
- **Then** it should animate out with fade + scale effect (150ms)

### Scenario: Popover content is properly sized
- **Given** the popover is open
- **When** the content is displayed
- **Then** it should have a minimum width of 320px
- **And** it should not overflow viewport horizontally

## Requirements
- CSS variable `--base-ui-popover-trigger-width` must be set to match trigger width
- Use `data-[state=open]` for animation state detection (not `data-open`)
- Ensure `tw-animate-css` animations are properly triggered