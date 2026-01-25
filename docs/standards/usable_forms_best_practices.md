# Best Practices for High-Conversion & Usable Forms (UX/UI)

Use these guidelines as a system prompt or reference for generating and auditing the Authentication (Login/Signup) components.

## 1. Design & Input Structure
* **Persistent Labels:** Never use placeholders as the only label. Use `htmlFor` and `id` to link labels and inputs.
* **Semantic Input Types:** Use correct `type` attributes (`email`, `password`, `tel`) to trigger appropriate mobile keyboards.
* **Visual Affordance:** Match input width to expected content length.
* **Password Visibility:** Always include a "show/hide" toggle. Do NOT disable pasting (to allow Password Managers).

## 2. Progressive Validation Strategy
* **Avoid "Change" Validation:** Do not show errors while the user is still typing (too aggressive).
* **"On Blur" Validation:** Validate once the user leaves the field.
* **Submit Validation:** Re-validate all fields on form submission.
* **Inline Errors:** Display error messages near the field, not just at the top.

## 3. Feedback & Error Communication
* **Actionable Messages:** Instead of "Invalid input," use "Email must include an @."
* **Clear Buttons:** Use Verb + Noun patterns (e.g., "Create Account" instead of "Send").
* **Clarity over Cleverness:** Avoid blaming the user. Use helpful, neutral language.

## 4. Mobile Optimization & Accessibility (WCAG)
* **Touch Targets:** Buttons and inputs must be at least 44x44px.
* **Font Size:** Minimum 16px for inputs to prevent automatic zoom on iOS.
* **Keyboard Navigation:** Ensure full `Tab` and `Enter` support. Maintain visible focus states (`:focus-visible`).
* **Screen Readers:** Use `aria-invalid="true"` and `role="alert"` for error messages.

## 5. Perceived Performance
* **Double Submission Prevention:** Disable the submit button immediately after the first click and show a loading state (spinner/text).
* **Instant Feedback:** Visual responses to interactions must occur within <100ms.