# ADR 018: Mobile-First UI Improvements

## Status
Accepted

## Context
During the "Mobile UI Polish" phase (Phase 7), user testing revealed significant usability issues on mobile devices:
1.  **Navigation**: The desktop navbar links were hidden, making "Login" and "Register" inaccessible.
2.  **Touch Targets**: Interactive elements (buttons) were too small or too close to screen edges.
3.  **Readability**: Glassmorphism backgrounds (`bg-white/5`) provided insufficient contrast for text on mobile screens.

## Decision
We decided to implement specific mobile-first patterns to address these issues without compromising the desktop experience.

### 1. Responsive Navigation (Hamburger Menu)
- **Pattern**: A collapsible "Hamburger" menu replaces inline links on viewports `< 768px` (`md` breakpoint).
- **Positioning**: Fixed to the top-right header area.
- **Implementation**:
    - Reduced Navbar height on mobile (`h-20`) to prevent the button from "floating" in content.
    - Added significant margin (`mr-6`) and padding (`p-3`) to ensure the touch target is easily accessible and clear of the "safe area".

### 2. High-Contrast Auth Forms
- **Problem**: Low opacity backgrounds looked good on desktop but washed out on mobile high-brightness screens.
- **Solution**:
    - **Desktop**: Retain `bg-black/60`.
    - **Mobile**: Use `bg-zinc-900/95` (near-opaque) for Auth cards.
    - **Rationale**: Readability > Aesthetics on small screens where glare is a factor.

### 3. Theme Consistency
- **Hamburger Button**: Relies on the brand's "Gold" accent (`#D4AF37`) but uses a semi-transparent background to blend with the header while maintaining visibility via shadows.

## Consequences
- **Positive**: dramatically improved mobile usability and accessibility (WCAG compliance for contrast and touch targets).
- **Negative**: Slight duplication of navigation logic (desktop links vs mobile menu links), manageable via shared route constants if needed in future.
