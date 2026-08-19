---
name: Exam Grader Frontend
description: A clean, professional interface for radiology exam grading
colors:
  paper-white: "oklch(0.992 0.002 95)"
  ink-black: "oklch(0.18 0.01 95)"
  radiology-blue: "oklch(0.28 0.02 150)"
  white: "oklch(0.985 0.002 95)"
  light-gray: "oklch(0.965 0.004 95)"
  muted-gray: "oklch(0.25 0.01 95)"
  very-light-gray: "oklch(0.965 0.004 95)"
  medium-gray: "oklch(0.5 0.01 95)"
  light-accent: "oklch(0.95 0.01 150)"
  accent-text: "oklch(0.25 0.02 150)"
  error-red: "oklch(0.577 0.245 27.325)"
  border-gray: "oklch(0.91 0.004 95)"
  input-background: "oklch(0.92 0.004 95)"
  focus-ring-blue: "oklch(0.55 0.02 150)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
    maxWidth: "65ch"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.025px"
    textTransform: "uppercase"
rounded:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
  xxl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.radiology-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
    fontWeight: "600"
  button-primary-hover:
    backgroundColor: "oklch(0.28 0.02 150 / 0.9)"
  button-destructive:
    backgroundColor: "{colors.error-red}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
  button-destructive-hover:
    backgroundColor: "oklch(0.577 0.245 27.325 / 0.9)"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.radiology-blue}"
    borderColor: "{colors.radiology-blue}"
    borderWidth: "1px"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
  button-outline-hover:
    backgroundColor: "{colors.radiology-blue}"
    textColor: "{colors.white}"
  input-field:
    backgroundColor: "{colors.input-background}"
    textColor: "{colors.ink-black}"
    borderColor: "{colors.border-gray}"
    borderWidth: "1px"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  input-field-focus:
    borderColor: "{colors.focus-ring-blue}"
    boxShadow: "0 0 0 3px oklch(0.55 0.02 150 / 0.5)"
  input-field-error:
    borderColor: "{colors.error-red}"
    boxShadow: "0 0 0 3px oklch(0.577 0.245 27.325 / 0.2)"
---
# Design System: Exam Grader Frontend

## Overview

**Creative North Star: "The Radiologist's Workstation"**

A clean, professional, and thoughtful interface that balances clinical precision with human-centered warmth—like a well-designed radiology workstation that supports extended focus during complex medical assessment tasks. Every visual element serves a clear functional or experiential purpose, with responsive feedback that feels immediate but never jarring, and deliberate restraint that avoids distracting flourishes while maintaining accessible confidence.

**Key Characteristics:**
- Light & Airy Foundation: Near-white backgrounds create openness and clarity
- Purposeful Accent: Single primary hue (blue-leaning) used sparingly for interactive elements and visual hierarchy
- Soft Geometry: Consistent rounded contours (0.75rem base radius) soften the interface without sacrificing precision
- Layered Depth: Subtle transparencies in hover states (90% opacity) and focus rings (50% opacity) create tactile feeling
- Considered Dark Mode: Thoughtfully rebalanced for low-light viewing while preserving relationships
- Responsive Feedback: Clear visual responses to user actions that feel immediate but not jarring
- Micro-Interaction Refinement: Attention to details like scrollbar behavior, icon handling, and transition timing
- Accessible Confidence: Interactive elements clearly communicate their state and availability
- Deliberate Restraint: Avoids animation excess or decorative flourishes that could distract from medical tasks
- Subtle Patterns: Dot grid backgrounds in empty states add gentle texture without visual clutter
- Refined Controls: Ultra-thin scrollbars that appear only when needed, preserving interface cleanliness
- Soft Elevation: Shadow and ring-based focus indicators that suggest tactility without harshness
- Clear Hierarchy: Text sizes and weights create obvious visual priority
- Generous Proportions: Whitespace used purposefully to separate concerns and reduce cognitive load
- Readability First: Font choices and rendering optimizations prioritize legibility for extended viewing

## Colors

The palette centers on a light, airy foundation with a single purposeful blue-leaning accent for interactive elements and visual hierarchy. Neutrals provide subtle variation for depth and layering, while an error red communicates critical states with restraint.

### Primary
- **Radiology Blue** (oklch(0.28 0.02 150)): Used for primary action buttons, links, and interactive elements that require user attention. Appears sparingly to maintain its significance as a signal color for actionability.

### Neutral
- **Paper White** (oklch(0.992 0.002 95)): Main background color for surfaces, creating a light and airy foundation that enhances readability and focus.
- **Very Light Gray** (oklch(0.965 0.004 95)): Subtle variant for secondary surfaces, cards, and containers that need slight elevation from the background.
- **Light Gray** (oklch(0.965 0.004 95)): Used for borders, dividers, and subtle separators between elements.
- **Medium Gray** (oklch(0.5 0.01 95)): Secondary text color for less prominent information, labels, and helper text.
- **Ink Black** (oklch(0.18 0.01 95)): Primary text color for body content, headings, and elements requiring maximum readability.
- **White** (oklch(0.985 0.002 95)): Text color on primary and dark backgrounds for optimal contrast.

### Accent
- **Light Accent** (oklch(0.95 0.01 150)): Subtle accent color for hover states, disabled elements, and low-emphasis decorative elements.
- **Accent Text** (oklch(0.25 0.02 150)): Text color on light accent surfaces.

### Error
- **Error Red** (oklch(0.577 0.245 27.325)): Communicates error states, invalid inputs, and destructive actions. Used sparingly to maintain its communicative power without causing alarm fatigue.

### Interactive States
- **Focus Ring Blue** (oklch(0.55 0.02 150)): Used for keyboard focus indicators, appearing at 50% opacity as a ring around interactive elements.
- **Hover Transparency**: Interactive elements use 90% opacity white or black overlays for hover states, creating a subtle layered depth effect.

## Typography

Typography follows a clear hierarchy optimized for readability during extended viewing sessions. The system pairs a serif display font for dignity and warmth with a clean sans-serif body font for clinical precision and legibility.

**Character:** The combination of Fraunces (display) and Inter (body) creates a thoughtful, professional pairing—Fraunces brings warmth and character to headings, while Inter ensures crystal-clear readability for dense informational content.

### Hierarchy
- **Display** (300, clamp(2.5rem, 7vw, 4.5rem), 1): Hero sections, page titles, and major statements that need to make an impression. Used sparingly for maximum impact.
- **Headline** (600, clamp(2rem, 5vw, 3.5rem), 1.2): Section headers, card titles, and important labels that need visual prominence.
- **Title** (600, clamp(1.75rem, 4vw, 2.75rem), 1.3): Subsection titles, moderately prominent headings, and navigation labels.
- **Body** (400, clamp(1.125rem, 2.5vw, 1.5rem), 1.6): Main content, paragraphs, form labels, and dense informational text. Includes max line length of 65–75ch for optimal readability.
- **Label** (500, 0.875rem, 1.4, 0.025px, uppercase): Form field labels, button text, and UI controls that need to be scannable and assertive.

## Layout

The layout system uses generous proportions and purposeful whitespace to separate concerns and reduce cognitive load. Content flows vertically with clear section divisions, creating a calm and focused experience that supports complex medical assessment tasks.

A 4-column grid provides flexibility for complex layouts while maintaining alignment and consistency. The system emphasizes vertical rhythm with consistent spacing between elements, using the spacing scale to create predictable vertical flow. Containers use padding to create breathing room around content, with max-width constraints on text-heavy sections to ensure optimal line length.

Responsive behavior adapts to different screen sizes by collapsing columns and adjusting spacing while maintaining the same proportional relationships and hierarchy.

## Elevation & Depth

The system conveys depth through subtle transparencies and soft elevation rather than harsh shadows, creating a tactile feeling that suggests interactiveness without visual harshness.

**One paragraph:** This system uses layered depth through transparencies in hover and focus states, combined with soft elevation from rounded contours and subtle outlines. Rather than relying on drop-shadows for elevation, it creates tactility through opacity changes on interactive elements and focus rings that suggest depth through layering.

### Shadow Vocabulary
- **Focus Ring** (`box-shadow: 0 0 0 3px oklch(0.55 0.02 150 / 0.5)`): Applied to interactive elements on keyboard focus, creating a visible but subtle indicator.
- **Error Ring** (`box-shadow: 0 0 0 3px oklch(0.577 0.245 27.325 / 0.2)`): Applied to inputs with validation errors, using the error color at low opacity.
- **Hover Overlay** (white or black at 10-15% opacity): Applied to interactive elements on hover, creating a subtle luminance shift that feels responsive without being distracting.

## Shapes

The form language centers on soft, consistent rounded contours that maintain precision while adding approachability. All interactive elements and containers use the same base radius, creating visual harmony and predictability throughout the interface.

**Description:** Consistent rounded corners (0.75rem base radius) applied universally to buttons, inputs, cards, modals, and containers. This creates a cohesive visual language where soft geometry unifies diverse elements without sacrificing crispness or precision. Border treatments are minimal—typically 1px solid lines in neutral grays—to maintain focus on content rather than chrome.

## Components

### Buttons
- **Shape:** consistently rounded with 0.75rem radius
- **Primary:** Radiology Blue background with white text, 1.5rem vertical padding and 2rem horizontal padding, medium font weight
- **Hover / Focus:** Background shifts to 90% opacity on hover; focus ring appears as 3px oklch(0.55 0.02 150 / 0.5) outline
- **Destructive:** Error Red background with white text, same padding and radius as primary
- **Destructive Hover / Focus:** Background shifts to 90% opacity on hover; focus/error ring applies
- **Outline:** Transparent background with Radiology Blue text and 1px border, same padding and radius
- **Outline Hover:** Radiology Blue background with white text
- **Ghost:** Transparent background with transparent border; hover applies Light Accent background with Accent Text
- **Link:** Radiology Blue text with underline offset; hover applies underline

### Inputs / Fields
- **Style:** Input Background background, Ink Black text, 1px Border Gray border, 0.75rem radius
- **Focus:** Border shifts to Focus Ring Blue with 3px ring at 50% opacity
- **Error:** Border shifts to Error Red with 3px ring at 20% opacity
- **Disabled:** Background shifts to Very Light Gray, text shifts to Medium Gray, cursor set to not-allowed

### Navigation
- **Style:** Horizontal flex layout with gap between items
- **Typography:** Label/Mono Font for items, Body Font for labels
- **Default State:** Text color Medium Gray
- **Hover/Active State:** Text color shifts to Radiology Blue, underline appears on active items
- **Mobile Treatment:** Collapses to vertical stack on narrow screens, maintains touch target minimums

### Cards / Containers
- **Corner Style:** 0.75rem radius
- **Background:** Paper White or Very Light Gray
- **Border:** 1px Border Gray (optional, for defined containers)
- **Inner Padding:** 1.5-2rem on all sides
- **Shadow Strategy:** No shadow by default; depth conveyed through background variation and optional subtle outlines

### Chips / Tags
- **Style:** Very Light Gray background, Medium Gray text, 0.75rem radius, 0.5rem horizontal padding and 0.25rem vertical padding
- **Selected State:** Radiology Blue background with White text
- **Hover State:** Background shifts to Light Gray

## Do's and Don'ts

### Do:
- **Do** use the purposeful accent (Radiology Blue) sparingly—limit to ≤15% of any given screen to maintain its significance as a signal for actionability
- **Do** maintain 0.75rem radius consistently across all interactive elements and containers for visual harmony
- **Do** provide immediate visual feedback on all interactions through opacity changes, focus rings, or subtle transforms
- **Do** preserve generous whitespace and clear hierarchy to reduce cognitive load during complex assessment tasks
- **Do** use dot grid backgrounds in empty states to add gentle texture without visual clutter
- **Do** ensure interactive elements clearly communicate their state through color, opacity, and cursor changes

### Don't:
- **Don't** use drop-shadows for primary elevation; rely instead on transparencies and background variations for depth
- **Don't** exceed 25% neutral gray backgrounds on any screen; maintain the light & airy foundation with Paper White as dominant
- **Don't** use animation durations under 100ms or over 500ms; target 200ms for most micro-interactions
- **Don't** use pure black (#000) or pure white (#fff); use the specified OKLCH values for optimal perception
- **Don't** compromise touch target minimums—ensure all interactive elements are at least 44x44pt
- **Don't** use decorative flourishes or unnecessary illustrations that could distract from medical assessment tasks