# Quality Assurance & Metrics Policy: TenderCheckAI

## [cite_start]1. Strategic "Honest Coverage": The 100/60/0 System [cite: 1729]
[cite_start]Instead of chasing a blind percentage, categorize code by business risk to focus testing resources where they matter most. We adopt the **"Honest Coverage"** philosophy: prioritize real logic over boilerplate inflation[cite: 1730].

- [cite_start]**CORE (100% Coverage Mandatory)**: [cite: 1731]
    - [cite_start]**Criteria**: The "Hard Base". Zero tolerance for logic errors[cite: 1733].
    - [cite_start]**Examples**: `src/domain` logic, business rules, and AI evaluators[cite: 1734].
    - [cite_start]**Action**: Vitest must enforce 100% statements/branches/lines[cite: 1735, 1736].
- [cite_start]**GLOBAL (Target 60% Coverage)**: [cite: 1736]
    - [cite_start]**Criteria**: Orchestration, UI, and Adapters. Reaching higher percentages here often inflates metrics by testing 3rd party boilerplate[cite: 1739].
    - [cite_start]**Examples**: Application services, controllers, and database adapters[cite: 1740, 1741].
    - [cite_start]**Action**: Focus on primary user flows. Accept 60% as a threshold for "Honest" verification[cite: 1742].
- [cite_start]**INFRASTRUCTURE (0% Coverage)**: [cite: 1743]
    - [cite_start]**Criteria**: Purely static or type-checking code[cite: 1745].
    - [cite_start]**Examples**: Constants, mocks, and type files (e.g., `types.ts`)[cite: 1746].

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