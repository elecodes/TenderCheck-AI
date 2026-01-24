# 🛡️ DevSecOps & Free Security Automation - TenderCheck AI

## 1. Static Analysis (SAST) & Dependencies
* **npm audit**: Run manually or in CI to detect vulnerable packages.
* **Snyk (Free Tier)**: Integrate for continuous monitoring of vulnerabilities in code and dependencies.
* **Dependabot**: Enable in GitHub to automate PRs for outdated and insecure libraries.

## 2. Secrets & Integrity
* **Trivy / GitLeaks**: Use to scan the repository for hardcoded secrets (API Keys, tokens) before every commit.
* **Lockfile Integrity**: Always commit `package-lock.json` to ensure dependency provenance.

## 3. OWASP Top 10 Mitigation (Manual & Auto)
* **A03: Injection**: Use Zod for validation and avoid `eval()` or dynamic string templates for commands.
* **A05: Security Misconfiguration**: Use **Helmet.js** (Zero-cost) to set secure headers.
* **A07: Identification and Authentication**: Use JWT with short expiration and secure `HttpOnly` cookies.

## 4. Automated Security Pipeline (CI/CD)
* **GitHub Actions**: 
    - Trigger `npm audit` on every Pull Request.
    - Run **Snyk Scan** on every push to `main`.
    - Fail the build if "High" or "Critical" vulnerabilities are found.