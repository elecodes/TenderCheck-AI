# ✍️ Microcopy & UX Writing Standards - TenderCheck AI

## 1. Tone and Voice
* **Professional yet Approachable**: The AI should sound like a senior technical auditor—precise and serious, but helpful.
* **Active Voice**: Use active verbs for buttons and calls to action (e.g., "Analyze Documents" instead of "Document Analysis Is Starting").
* **Consistency**: Use the same terminology throughout the app (e.g., if you call it a "Tender," don't switch to "Contract" or "Licitación" in the UI).

## 2. AI Interaction Copy
* **Visibility of Status**: Use descriptive text during processing, such as "Scanning Pliego for requirements..." or "Comparing Offer with Article 4...".
* [cite_start]**Transparency**: When the AI is unsure, use phrases like: "I found a potential match, but it requires human verification"[cite: 70, 915].
* **Avoid "Robot Speak"**: Instead of "Error 500: Execution failed," use "Something went wrong while reading the PDF. Please try uploading a clearer version."

## 3. Feedback and Guidance
* **Actionable Tooltips**: Every icon should have a tooltip explaining its function in plain English.
* **Empty States**: If no analysis exists yet, don't show a blank screen. Use: "Ready to start? Upload your first Pliego and Offer to begin the validation."
* **Loading States**: During long wait times, use microcopy to manage expectations: "This usually takes 30 seconds for large documents".

## 4. Accessibility and Microcopy
* **Descriptive ARIA Labels**: Buttons should have labels that describe the result of the action (e.g., `aria-label="Download final validation report in PDF"`).
* **Inclusive Language**: Avoid technical jargon that isn't industry-standard; prioritize clarity for all levels of users.