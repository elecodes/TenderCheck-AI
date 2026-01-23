# 📊 Metrics & Coverage Policy - TenderCheck AI

## 1. Code Coverage Policy (The "Honest Coverage" 100/80/0)
[cite_start]To ensure reliability, we follow a tiered coverage strategy[cite: 198]:
* **CORE (src/domain & critical helpers)**: **100% coverage** enforced. [cite_start]Every business rule must be tested[cite: 199].
* [cite_start]**GLOBAL (Application & UI logic)**: **80% minimum coverage**[cite: 200, 657, 690].
* [cite_start]**INFRA (Config & Setup)**: **0% coverage** (excluded from metrics to avoid "noise")[cite: 201].

## 2. Technical Quality Metrics
[cite_start]We implement automatic quality controls to monitor code health[cite: 655, 689]:
* [cite_start]**Cyclomatic Complexity**: We monitor complexity to ensure functions remain simple and testable[cite: 656, 718].
* **Maintainability Index**: Aim for high scores by avoiding "God Objects" and long functions.
* **Cognitive Complexity**: Code must be easy for a human to read, not just for the compiler.

## 3. Quality Gates & Enforcement
* [cite_start]**Husky & Git Hooks**: A pre-push hook will block any commit that fails to meet the 80% coverage threshold or has failing tests[cite: 202, 657, 719].
* [cite_start]**GitHub Actions**: Our CI pipeline will audit code quality on every Pull Request, ensuring deficiente code never reaches production[cite: 657, 690, 723].

## 4. Observability & Real-world Metrics
[cite_start]Beyond testing, we complement quality with observability[cite: 664]:
* [cite_start]**Performance Monitoring**: Track "perceived speed" and Core Web Vitals[cite: 664, 682].
* [cite_start]**Error Tracking (Sentry)**: Implement real-time alerts for production errors and performance degradation[cite: 664, 665].
* [cite_start]**AI Audit Logs**: Every decision source (Rule vs AI) must be logged to ensure system transparency[cite: 1073].