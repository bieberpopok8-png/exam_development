"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// next-themes injects an inline <script> tag to set the theme class before
// hydration (avoiding a flash of the wrong theme). React 19 / Next.js 16.2+
// now warns whenever ANY component renders a raw <script> tag, which produces
// a false-positive error for this specific, intentional use case.
// next-themes hasn't shipped a fix for this yet (see
// https://github.com/pacocoursey/next-themes/issues/385), so we filter out
// just this one message. All other console errors still pass through.
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError(...args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // No mount-gating here: next-themes relies on its inline script running
  // before hydration to set the correct theme class immediately. Gating
  // rendering behind a `mounted` state defeats that and can cause a flash
  // of the wrong theme. next-themes already handles the hydration mismatch
  // internally (it sets `suppressHydrationWarning` on <html> for you).
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}