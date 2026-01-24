# 📊 Code Coverage Standards - TenderCheck AI

## 1. Coverage Thresholds (The 80/100 Rule)
To ensure the reliability of the legal and technical validation, we enforce:
- **Global Project Coverage**: Minimum **80%**. The build must fail if it drops below this.
- **Domain Layer (Critical)**: **100% Coverage**. Every entity, value object, and domain service must be fully tested as they contain the "source of truth."
- **Infrastructure Layer**: Minimum **60%**. Focus on error handling and data mapping (Zod schemas).

## 2. Testing Priorities
1.  **Logic over UI**: Prioritize testing the `ValidationEngine` and `PdfParser` over simple React components.
2.  **Edge Cases**: Coverage must include "sad paths" (e.g., corrupted PDFs, empty documents, AI timeouts).
3.  **Boundary Testing**: Validate that legal rules (Art. 145 LCSP) trigger correctly at their limits.

## 3. Coverage Metrics to Track
- **Statement Coverage**: Ensure every line of code is executed at least once.
- **Branch Coverage**: Ensure every `if/else` and `switch` case is exercised.
- **Function Coverage**: Ensure all exported functions are called in tests.

## 4. Automation & Reports
- **Vitest**: Use Vitest's built-in coverage tool (v8 or c8).
- **Reports**: Generate an LCOV or HTML report in every test run for visual auditing.
- **Enforcement**: Husky must run `npm run test:coverage` before every `git push`.