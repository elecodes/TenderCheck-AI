# ADR 006: UI Theme, Routing & Brand Identity

**Date**: 2026-01-25
**Status**: Accepted

## Context
Initial iterations of the frontend used a generic "black" dark mode and lacked a centralized routing strategy for the Landing Page and Dashboard transition. The user highlighted issues with:
1.  **Contrast**: The "pitch black" (`#000000`) background was too aggressive.
2.  **Identity**: Lack of brand colors (Emerald/Gold) in the Landing Page.
3.  **Routing**: `useRoutes` errors and lack of authenticated route protection.

## Decision
We have decided to:
1.  **Adopt a "Soft Charcoal" Dark Theme**:
    -   Replace pure black with `#1a1c1a` (Deep Stone/Charcoal) and `#242B33` (Slate) variants.
    -   This reduces eye strain and provides a more premium feel.
    -   Global CSS variables and Tailwind config updated (`colors.brand.dark`).

2.  **Harmonize Brand Identity**:
    -   **Primary Action Color**: Emerald Green (`emerald-600`) for consistency with the Dashboard.
    -   **Accent/Luxury Color**: Metallic Gold (`#C5A028`) for specific high-value elements (Logos, "Pliego" terminology, Upload Icons).
    -   **Landing Page**: Uses a "Light Sage to Stone" gradient (`#E8E6DE` -> `#B8C1B7`) to contrast with the dark Dashboard, creating a "Day/Night" transition effect upon login.

3.  **Implement Client-Side Routing**:
    -   Use `react-router-dom` v6.
    -   `App.tsx` serves as the Router root.
    -   Routes:
        -   `/` (Landing Page - Public)
        -   `/login`, `/register` (Auth - Public, Centered Layout)
        -   `/dashboard` (App - Protected/Private)

## Consequences
### Positive
-   **Cohesive UX**: Seamless transition between marketing (Landing) and product (Dashboard).
-   **Visual Comfort**: Reduced harsh contrast in dark mode.
-   **Maintainability**: Centralized router makes adding future pages (e.g., `/settings`, `/history`) trivial.

### Negative
-   **Complexity**: Two distinct visual themes (Light Landing vs Dark Dashboard) requires careful CSS management to avoid "FOUC" (Flash of Unstyled Content) or theme bleeding.
