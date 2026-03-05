# ADR 032: UI Design System & Theming Strategy

Date: 2026-03-04

## Status

Accepted

## Context

The application required a professional, trustworthy aesthetic suitable for legal and corporate environments (Tender Analysis). The initial design was functional but lacked a cohesive identity. We needed to support both Light and Dark modes while maintaining sufficient contrast and visual hierarchy.

## Decision

We have implemented a custom **Design System** using Tailwind CSS, characterized by:

1.  **Color Palette**:
    *   **Light Mode**: Based on "Crema" tones (`#D3D0C2`, `#F5F4F0`) for backgrounds, paired with `Brand Gris` (`#374151`) for text to reduce eye strain compared to pure black.
    *   **Dark Mode**: Uses "Charcoal" (`#242B33`) and "Gunmetal" (`#1a1f24`) for a modern, deep aesthetic without the harshness of pure black (`#000000`).
    *   **Accents**: "Gold" (`#C5A028`) for primary highlights (Trust/Premium feel) and "Emerald" (`#10b981`) for success states.

2.  **Typography**:
    *   **Headings**: *Playfair Display* (Serif) to convey authority and tradition.
    *   **Body**: *Inter* (Sans-serif) for high readability in dense text (analysis results).

3.  **Theming Engine**:
    *   Utilizes Tailwind's `darkMode: 'class'` strategy.
    *   State managed via React Context (`ThemeContext`), persisting user preference in `localStorage`.
    *   Components are built with semantic color tokens (e.g., `text-brand-gris dark:text-gray-100`) rather than hardcoded hex values.

4.  **Visual Effects**:
    *   **Glassmorphism**: Used in cards and overlays (`bg-white/30 backdrop-blur-md`) to create depth.
    *   **Soft Shadows**: Custom shadow utilities to lift elements subtly off the background.

## Consequences

*   **Consistency**: All components now share a unified look and feel.
*   **Maintainability**: Global changes can be made by updating the Tailwind configuration.
*   **Accessibility**: High contrast ratios are maintained in both modes (checked via WCAG standards).
*   **Development Speed**: Utility-first CSS allows for rapid iteration without fighting stylesheet specificity.
