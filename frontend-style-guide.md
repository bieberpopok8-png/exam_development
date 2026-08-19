# Frontend Style Guide for Exam Grader

## Overview
This document captures the styling details of the existing frontend2 application to be used as reference for building a new frontend with similar aesthetics.

## Core Technologies
- **Framework**: Next.js 13+ (app router)
- **Styling**: Tailwind CSS with custom CSS variables
- **UI Components**: Radix UI primitives
- **Utilities**: class-variance-authority (cva) for component variants
- **Icons**: Likely Lucide or similar (based on common Radix usage)

## Color System (from src/app/globals.css)
The design uses OKLCH color space with light/dark mode support.

### Light Mode (`:root`)
- `--background`: oklch(0.992 0.002 95) - nearly white
- `--foreground`: oklch(0.18 0.01 95) - dark text
- `--primary`: oklch(0.28 0.02 150) - blue-ish accent
- `--primary-foreground`: oklch(0.985 0.002 95) - white text on primary
- `--secondary`: oklch(0.965 0.004 95) - light gray
- `--secondary-foreground`: oklch(0.25 0.01 95) - muted text on secondary
- `--muted`: oklch(0.965 0.004 95) - very light gray
- `--muted-foreground`: oklch(0.5 0.01 95) - medium gray text
- `--accent`: oklch(0.95 0.01 150) - light accent
- `--accent-foreground`: oklch(0.25 0.02 150) - accent text
- `--destructive`: oklch(0.577 0.245 27.325) - red-orange for errors
- `--border`: oklch(0.91 0.004 95) - light border
- `--input`: oklch(0.92 0.004 95) - input background
- `--ring`: oklch(0.55 0.02 150) - focus ring

### Dark Mode (`.dark`)
- `--background`: oklch(0.16 0.006 150) - dark blue-gray
- `--foreground`: oklch(0.96 0.004 95) - light text
- `--primary`: oklch(0.78 0.06 150) - lighter blue in dark
- `--primary-foreground`: oklch(0.18 0.02 150) - dark text on primary
- And similar inversions for other colors

## Border Radius
```css
--radius: 0.75rem; /* Base radius */
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

## Base Styles
- Uses `border-border` and `outline-ring/50` utilities globally
- Body: `bg-background text-foreground` with antialiased fonts
- Custom selection color: `color-mix(in oklch, var(--primary) 22%, transparent)`

## Custom Utilities
1. **Scrollbars** (`scroll-thin` class):
   - Thin scrollbars with colored thumb and transparent track
   - Thumb: `color-mix(in oklch, var(--muted-foreground) 25%, transparent)`
   - Hover: increases to 45% opacity

2. **No Scrollbar** (`no-scrollbar` class):
   - Hides scrollbars while maintaining functionality

3. **Dot Grid Background** (`bg-dotgrid` class):
   - Subtle dotted pattern for empty states
   - `radial-gradient` with 18px spacing

## Component Styling Example: Button
The button component demonstrates the styling pattern used throughout:

### Variants
- **default**: `bg-primary text-primary-foreground shadow-xs hover:bg-primary/90`
- **destructive**: `bg-destructive text-white shadow-xs hover:bg-destructive/90`
- **outline**: `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`
- **secondary**: `bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80`
- **ghost**: `hover:bg-accent hover:text-accent-foreground`
- **link**: `text-primary underline-offset-4 hover:underline`

### Sizes
- **default**: `h-9 px-4 py-2 has-[>svg]:px-3`
- **sm**: `h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5`
- **lg**: `h-10 rounded-md px-6 has-[>svg]:px-4`
- **icon**: `size-9`

### Common Features
- `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium`
- Transition effects: `transition-all`
- Disabled state: `disabled:pointer-events-none disabled:opacity-50`
- SVG handling: `[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0`
- Focus styles: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Error states: `aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`

## Design Patterns Observed
1. **Radix UI Integration**: Components wrap Radix primitives (e.g., Button uses Slot from @radix-ui/react-slot)
2. **Class Variants**: Uses cva for consistent variant APIs
3. **Utility First**: Heavy reliance on Tailwind utilities with custom CSS variables for theming
4. **Dark Mode**: Full dark mode support via CSS variables
5. **Accessibility**: Focus rings, proper contrast, aria attributes implied
6. **Component Composition**: Small, reusable components (seen in ui/* directory)

## File Structure Notes
- Components organized by feature (`src/components/exam/*`, `src/components/home/*`, etc.)
- UI primitives in `src/components/ui/` (Radix-based)
- Layout: `src/app/layout.tsx`
- Global styles: `src/app/globals.css`
- Utilities: `src/lib/utils.ts` (contains `cn` function)

## Implementation Recommendations for New Frontend
1. Maintain the same Tailwind + CSS variable approach for theming
2. Use Radix UI for accessible primitives
3. Adopt similar cva pattern for component variants
4. Preserve the color palette and radius values
5. Keep the same utility class patterns (focus states, hover effects, disabled states)
6. Consider maintaining the same component hierarchy and naming conventions