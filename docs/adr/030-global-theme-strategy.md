# 30. Global Theme Strategy and Glassmorphism UI

Date: 2026-02-14

## Status

Accepted

## Context

The initial application design had inconsistent styling between the Landing Page (Light Mode, "Crema" palette) and the Dashboard/Auth pages (Dark Mode by default). This created a disjointed user experience. Users expected the premium, accessible aesthetic of the Landing Page to persist throughout the application, while also retaining the option for a Dark Mode for low-light environments.

## Decision

We have adopted a **Global Theme Strategy** with a **Glassmorphism** design language.

### 1. Global Theme Provider
*   We use a React Context (`ThemeContext`) to manage `light` and `dark` modes globally.
*   The theme state is persisted in `localStorage` to remember user preference.
*   The default mode matches the system preference (`prefers-color-scheme`) but defaults to `light` to showcase the premium brand aesthetic.

### 2. Design System: Glassmorphism
We utilize a "Glassmorphism" aesthetic to create depth and hierarchy.
*   **Background**: A complex mesh gradient (`from-[#E8E6DE] via-[#D3D0C2] to-[#B8C1B7]`) provides a rich, tactile feel in Light Mode. Dark mode uses deep charcoal gradients.
*   **Cards**: UI elements use semi-transparent white backgrounds with backdrop blur (`backdrop-blur-3xl`, `bg-white/30`) and subtle white borders (`border-white/50`).
*   **Shadows**: Soft, colored shadows (`shadow-[0_20px_50px_rgba(31,38,135,0.1)]`) lift elements off the page.

### 3. Typography and Color Palette
*   **Fonts**: *Playfair Display* for headings (serif, trustworthy) and *Inter* for body text (sans-serif, legible).
*   **Colors**:
    *   **Brand**: Deep Charcoal (`#2D312D`) for text.
    *   **Action**: Emerald Green (`emerald-600`) for primary buttons.
    *   **Accent**: Gold (`#C5A028`) for highlights.

## Consequences

### Positive
*   **Consistency**: The user experiences a seamless visual journey from Landing Page to Dashboard.
*   **Perceived Value**: The premium aesthetic aligns with the professional nature of the tool (Tender Analysis).
*   **Accessibility**: High contrast is maintained in both modes; the light mode avoids harsh white backgrounds.

### Negative
*   **Complexity**: CSS/Tailwind classes are more verbose due to the `dark:` modifiers and complex gradients.
*   **Performance**: Heavy use of `backdrop-blur` can be performance-intensive on very low-end devices (mitigated by CSS hardware acceleration).
