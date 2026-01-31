# Quality Assurance & Metrics Policy: TenderCheckAI

## [cite_start]1. Strategic Coverage: The 100/80/0 System [cite: 1729]
[cite_start]Instead of chasing a blind percentage, categorize code by business risk to focus testing resources where they matter most[cite: 1730].

- [cite_start]**CORE (100% Coverage Mandatory)**: [cite: 1731]
    - [cite_start]**Criteria**: Code where failure causes direct business loss, security breaches, or critical data corruption[cite: 1733].
    - [cite_start]**Examples**: Requirement validation logic, data persistence utils, and security handlers[cite: 1734].
    - [cite_start]**Action**: Configure `vitest.config.ts` to strictly require 100% in statements, branches, functions, and lines for these files[cite: 1735, 1736].
- [cite_start]**IMPORTANT (80% Coverage Required)**: [cite: 1736]
    - [cite_start]**Criteria**: User-facing functionalities where failure causes frustration but not immediate business failure[cite: 1739].
    - [cite_start]**Examples**: UI components, dashboards, and input forms[cite: 1740, 1741].
    - [cite_start]**Action**: Focus on primary user flows and omit rare edge cases[cite: 1742].
- [cite_start]**INFRASTRUCTURE (0% Strategic Coverage)**: [cite: 1743]
    - [cite_start]**Criteria**: Static code or code self-validated by TypeScript[cite: 1745].
    - [cite_start]**Examples**: Interfaces, constants, and type configurations (e.g., `types/interfaces.ts`)[cite: 1746].

## [cite_start]2. Actionable Metrics (Decision-Driving) [cite: 1747]
[cite_start]Avoid vanity metrics; prioritize data that enables specific technical or business decisions[cite: 1748, 1749].

- [cite_start]**Test Success Rate**: [cite: 1751]
    - [cite_start]**Thresholds**: If it drops below 95%, halt new feature development to fix tests[cite: 1753]. [cite_start]Below 90% triggers a "Code Freeze"[cite: 1754].
- [cite_start]**Production Error Rate**: [cite: 1755]
    - **Thresholds**: Investigate immediately if >1%. [cite_start]Declare an emergency if >2%[cite: 1756].
- [cite_start]**Mean Time to Recovery (MTTR)**: [cite: 1757]
    - [cite_start]**Goal**: Measure team speed in fixing issues to understand maintenance health[cite: 1758].
- [cite_start]**Visual Feedback**: Use Binary Thresholds (Red/Green) in the console/dashboard for instant health assessment[cite: 1759].

## [cite_start]3. Automation with Quality Gates (Husky) [cite: 1760]
[cite_start]Use Git Hooks managed by Husky to prevent defective code from entering the repository[cite: 1761].

- [cite_start]**Pre-Commit (Fast < 2 min)**: [cite: 1762]
    - [cite_start]**Tasks**: Linting and basic unit tests to prevent simple syntax or style errors[cite: 1763, 1764].
- [cite_start]**Pre-Push (Exhaustive 2-5 min)**: [cite: 1765]
    - [cite_start]**Tasks**: Strategic coverage checks (100/80/0) and E2E tests[cite: 1766].
    - [cite_start]**Goal**: Block any code that fails thresholds before it reaches CI[cite: 1767, 1768].

## [cite_start]4. Observable Testing & Debugging [cite: 1769]
[cite_start]Leverage built-in tools over custom ones to reduce debugging time from hours to minutes[cite: 1770].

- [cite_start]**HTML Reports**: Use native reports to identify performance bottlenecks and slow tests[cite: 1771].
- [cite_start]**Trace Viewer**: Enable "retain-on-failure" traces in Playwright to see network requests, screenshots, and logs step-by-step for every failure[cite: 1772, 1773].
- [cite_start]**JSON Reports**: Utilize native JSON output to automatically extract success rates and durations without complex scripts[cite: 1775].