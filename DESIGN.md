---
name: Exam Grading System
description: A clean, simple, soft web application for automated exam grading with AI/OCR
colors:
  background: "oklch(0.992 0.002 95)"
  foreground: "oklch(0.18 0.01 95)"
  primary: "oklch(0.28 0.02 150)"
  primary-foreground: "oklch(0.985 0.002 95)"
  secondary: "oklch(0.965 0.004 95)"
  secondary-foreground: "oklch(0.25 0.01 95)"
  muted: "oklch(0.965 0.004 95)"
  muted-foreground: "oklch(0.5 0.01 95)"
  accent: "oklch(0.95 0.01 150)"
  accent-foreground: "oklch(0.25 0.02 150)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-foreground: "oklch(0.985 0.002 95)"
  border: "oklch(0.91 0.004 95)"
  input: "oklch(0.92 0.004 95)"
  ring: "oklch(0.55 0.02 150)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.18 0.01 95)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.18 0.01 95)"
  sidebar: "oklch(0.97 0.004 95)"
  sidebar-foreground: "oklch(0.2 0.01 95)"
  sidebar-primary: "oklch(0.28 0.02 150)"
  sidebar-primary-foreground: "oklch(0.985 0.002 95)"
  sidebar-accent: "oklch(0.93 0.01 150)"
  sidebar-accent-foreground: "oklch(0.25 0.02 150)"
  sidebar-border: "oklch(0.9 0.004 95)"
  sidebar-ring: "oklch(0.55 0.02 150)"
  chart-1: "oklch(0.646 0.222 41.116)"
  chart-2: "oklch(0.6 0.118 184.704)"
  chart-3: "oklch(0.398 0.07 227.392)"
  chart-4: "oklch(0.828 0.189 84.429)"
  chart-5: "oklch(0.769 0.188 70.08)"
typography:
  sans:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "calc(var(--radius) - 4px)"
  md: "calc(var(--radius) - 2px)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) + 4px)"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "2.5rem"
  "3xl": "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1.5rem"
    fontWeight: "500"
  button-primary-hover:
    backgroundColor: "oklch(0.25 0.025 150)"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1.5rem"
    border: "1px solid {colors.border}"
  button-secondary-hover:
    backgroundColor: "oklch(0.94 0.005 95)"
  input-default:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  input-focus:
    borderColor: "{colors.ring}"
    boxShadow: "0 0 0 2px {colors.ring}"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  card-hover:
    boxShadow: "0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.06)"
---
# Design System: Exam Grading System

## Overview

**Creative North Star: "The Grading Workshop"**

The Exam Grading System embodies a clean, simple, and soft aesthetic that reduces cognitive load during intensive grading periods. Inspired by a well-organized professor's desk, the design prioritizes clarity, focus, and gentle visual hierarchy to support educators in their assessment workflow. The system avoids clinical sterility while maintaining professional appeal, creating an environment where grading feels manageable rather than overwhelming.

**Key Characteristics:**
- Soft, approachable color palette with sufficient contrast for accessibility
- Generous spacing and rounded corners for visual comfort
- Consistent component styling that reinforces predictable interactions
- Subtle depth and elevation to guide visual hierarchy
- Typography optimized for readability during extended viewing sessions

## Colors

The color system uses OKLCH for perceptually uniform color relationships, providing reliable contrast and harmonious combinations.

### Primary
- **OKLCH Blue (oklch(0.28 0.02 150))**: Used for primary actions, interactive elements, and visual emphasis. Appears on primary buttons, links, and active states to draw attention to key workflow actions.
- **Primary Foreground (oklch(0.985 0.002 95))**: White text for use on primary backgrounds, ensuring optimal contrast.

### Secondary
- **Soft Gray (oklch(0.965 0.004 95))**: Applied to secondary buttons, form fields, and background elements requiring subtle differentiation from pure white.
- **Secondary Foreground (oklch(0.25 0.01 95))**: Dark gray text for secondary content and borders.

### Neutral
- **Background (oklch(0.992 0.002 95))**: Near-white page and container background, providing maximum brightness without harshness.
- **Foreground (oklch(0.18 0.01 95))**: Near-black primary text color for optimal readability.
- **Muted (oklch(0.965 0.004 95))**: Soft gray for disabled states, subtle borders, and de-emphasized content.
- **Muted Foreground (oklch(0.5 0.01 95))**: Medium gray text for secondary information, placeholders, and helper text.

### Accent
- **Accent (oklch(0.95 0.01 150))**: Very light blue for highlights, selected states, and positive feedback indicators.
- **Accent Foreground (oklch(0.25 0.02 150))**: Blue text for accent-colored backgrounds.

### Destructive
- **Destructive (oklch(0.577 0.245 27.325))**: Warm reddish-orange for error states, destructive actions, and critical warnings.
- **Destructive Foreground (oklch(0.985 0.002 95))**: White text for use on destructive backgrounds.

### Border & Input
- **Border (oklch(0.91 0.004 95))**: Light gray for form fields, card separators, and subtle dividers.
- **Input (oklch(0.92 0.004 95))**: Nearly white background for form fields and inputs.
- **Ring (oklch(0.55 0.02 150))**: Focus ring color for keyboard accessibility and interactive feedback.

### Card & Popover
- **Card (oklch(1 0 0))**: Pure white background for cards, modals, and elevated containers.
- **Card Foreground (oklch(0.18 0.01 95))**: Near-black text for optimal readability on card backgrounds.
- **Popover (oklch(1 0 0))**: Pure white background for popovers and tooltips.
- **Popover Foreground (oklch(0.18 0.01 95))**: Near-black text for popover content.

### Sidebar
- **Sidebar (oklch(0.97 0.004 95))**: Very light gray background for navigation sidebar.
- **Sidebar Foreground (oklch(0.2 0.01 95))**: Dark gray text for sidebar navigation items.
- **Sidebar Primary (oklch(0.28 0.02 150))**: Same as primary color for active sidebar items.
- **Sidebar Primary Foreground (oklch(0.985 0.002 95))**: White text for active sidebar items.
- **Sidebar Accent (oklch(0.93 0.01 150))**: Light accent color for sidebar highlights.
- **Sidebar Accent Foreground (oklch(0.25 0.02 150))**: Accent foreground text for sidebar accents.
- **Sidebar Border (oklch(0.9 0.004 95))**: Sidebar divider and separator color.
- **Sidebar Ring (oklch(0.55 0.02 150))**: Same as global ring color for sidebar focus states.

### Data Visualization
- **Chart 1 (oklch(0.646 0.222 41.116))**: Warm orange for primary data series.
- **Chart 2 (oklch(0.6 0.118 184.704))**: Cool blue for secondary data series.
- **Chart 3 (oklch(0.398 0.07 227.392))**: Purple for tertiary data series.
- **Chart 4 (oklch(0.828 0.189 84.429))**: Soft orange for quaternary data series.
- **Chart 5 (oklch(0.769 0.188 70.08))**: Yellow-orange for quinary data series.

## Typography

The typography system uses the Geist font family for modern, highly legible letterforms optimized for screen reading.

### Font Families
- **Display/Body Font**: Geist Sans (var(--font-geist-sans)) with system-ui fallback
- **Mono/Code Font**: Geist Mono (var(--font-geist-mono)) with ui-monospace fallback

### Character
Geist Sans provides excellent readability with subtle personality - clean, modern, and approachable without being distracting. The pairing of sans-serif for body text and monospace for code/data creates clear visual distinction while maintaining harmony.

### Hierarchy
- **Display** (400, clamp(2.5rem, 7vw, 4.5rem), 1): Used for main page headers and major section titles requiring visual impact.
- **Headline** (400, clamp(2rem, 5vw, 3.5rem), 1.3): Applied to section headers and important content divisions.
- **Title** (400, clamp(1.5rem, 3vw, 2.5rem), 1.4): Used for card headers, subsection titles, and prominent labels.
- **Body** (400, clamp(0.875rem, 0.75rem + 0.5vw, 1rem), 1.5): Primary text for paragraphs, form labels, and detailed content. Optimized for 65-75 characters per line for comfortable reading.
- **Label** (400, clamp(0.75rem, 0.65rem + 0.3vw, 0.875rem), 1.2, uppercase): Used for form field labels, table headers, and categorical identifiers with tracked letter spacing.

## Layout

The layout system employs an 8-point grid with consistent spacing ratios that create visual rhythm and proportional harmony. Containers use maximum width constraints to ensure optimal line lengths for readability on larger screens. The system adapts gracefully from mobile to desktop through responsive breakpoints at 640px, 768px, 1024px, and 1280px, maintaining consistent proportional relationships while adjusting density and white space appropriately for each viewport size.

## Elevation & Depth

The system uses a hybrid approach combining subtle shadows with tonal layering to convey depth and hierarchy. Elevated surfaces receive gentle drop shadows that suggest physical separation, while tonal variations in background colors provide additional depth cues without relying solely on shadow effects.

### Shadow Vocabulary
- **Ambient Low** (`0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.06)`): Applied to cards, buttons, and interactive elements on hover or focus to indicate interactivity.
- **Ambient Medium** (`0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -2px oklch(0 0 0 / 0.08)`): Used for dropdowns, modals, and elevated panels requiring stronger depth indication.
- **Ambient High** (`0 20px 25px -5px oklch(0 0 0 / 0.1), 0 10px 10px -3px oklch(0 0 0 / 0.04)`): Reserved for full-screen overlays and large modal dialogs.

## Shapes

The form language emphasizes gentle curvature with consistent radius values that create visual harmony across components. All corners use the same radius scale, preventing visual dissonance between adjacent elements. Borders are subtle and uniform, contributing to the soft, approachable aesthetic without creating visual noise. The system avoids sharp corners entirely, reinforcing the clean and soft design direction requested by stakeholders.

## Components

### Buttons
- **Shape:** Slightly rounded (var(--radius-md) / 8.8px)
- **Primary:** Blue background with white text, medium padding (0.5rem 1.5rem), font weight 500
- **Hover / Focus:** Slightly darker blue background with subtle scale transformation
- **Secondary / Ghost:** Soft gray background with dark gray text and thin border, medium padding
- **Secondary Hover:** Lighter gray background on hover

### Cards / Containers
- **Corner Style:** Generous radius (var(--radius-lg) / 12px)
- **Background:** Pure white (oklch(1 0 0))
- **Shadow Strategy:** Ambient Low shadow on hover/focus states
- **Border:** None by default, optional thin border using --border color
- **Internal Padding:** Moderate spacing (1rem) on all sides

### Inputs / Fields
- **Style:** Nearly white background (oklch(0.92 0.004 95)) with thin border (1px solid oklch(0.91 0.004 95)) and medium radius (var(--radius-md) / 8.8px)
- **Focus:** Border shifts to ring color (oklch(0.55 0.02 150)) with subtle ring glow
- **Error:** Border shifts to destructive color with destructive text for helper messages
- **Disabled:** Muted background with muted foreground text and cursor: not-allowed

### Navigation
- **Style:** Vertical sidebar with soft gray background and adequate padding
- **Typography:** Body text weight for navigation items, slightly larger for headers
- **Default State:** Soft gray text on very light gray background
- **Hover State:** Text darkens slightly, background remains consistent
- **Active State:** Primary blue background with white text
- **Mobile Treatment:** Collapses to bottom navigation bar on screens below 640px width

## Do's and Don'ts

### Do:
- **Do** use the primary color sparingly (≤15% of any given screen) to maintain its visual significance for important actions
- **Do** maintain minimum 4.5:1 contrast ratio for all text and meaningful icons (verified against WCAG AA standards)
- **Do** apply consistent radius values (var(--radius) scale) to all corners for visual harmony
- **Do** use generous spacing (8pt grid) to create visual breathing room and reduce cognitive load
- **Do** leverage subtle shadows and elevation to communicate hierarchy and interactivity
- **Do** use the Geist font family for optimal screen readability during extended grading sessions

### Don't:
- **Don't** use pure black (#000000) or pure white (#FFFFFF) - use the OKLCH values provided for softer, more perceivable alternatives
- **Don't** apply borders thicker than 1px or use harsh, contrasting colors for dividers
- **Don't** use more than two type weights (400 regular, 500 medium) in any given interface context
- **Don't** create color combinations that haven't been explicitly defined in the design system
- **Don't** apply shadows to elements that are already at the lowest elevation level
- **Don't** use animations that exceed 200ms duration or create distracting visual motion