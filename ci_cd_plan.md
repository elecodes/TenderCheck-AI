# Implementation Plan: CI/CD Automation

## Goal
Establish a robust automated pipeline using GitHub Actions to ensure code quality and prevent regressions.

## Proposed Workflows

### 1. Quality & Test Pipeline (`.github/workflows/quality.yml`)
**Triggers**: Pull Request to `main`, Push to `main`.
**Jobs**:
*   **Backend Check**:
    *   Install dependencies.
    *   Run Linter (`npm run lint`).
    *   Run Unit Tests (`npm test`).
*   **Frontend Check**:
    *   Install dependencies.
    *   Run Build (`npm run build`). (Ensures no type errors or broken imports).

### 3. Deployment Pipeline (Render)
**Type**: Continuous Deployment (CD).
**Trigger**: Push to `main` (Automatic via Render Dashboard).
1.  **Backend**: Render pulls `main`, builds (`npm build`), and deploys if tests pass.
2.  **Frontend**: Render pulls `main`, builds (`npm build`), and publishes static assets.

## 3. Deployment Documentation
See **[Deployment Guide](docs/deployment_guide.md)** for detailed Render setup.

## Tasks
- [ ] Create `.github/workflows/quality.yml`.
- [ ] Create `.github/workflows/security.yml`.
- [ ] Add `test:ci` script to backend `package.json` (if needed for CI environment).
