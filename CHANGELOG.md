# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Large PDF Support**: Page-based chunking strategy for handling long tender documents (80+ pages).
  - Automatic detection for PDFs > 15 pages
  - 10-page chunks with parallel processing (up to 3 concurrent)
  - Context preservation with page metadata in prompts
  - Graceful degradation on chunk failures

### Security
- Patched undici (7.19.1 → 7.24.0) - 6 high/critical vulnerabilities fixed
- Patched express-rate-limit (8.2.1 → 8.3.1) - 1 high vulnerability fixed
- Patched jspdf (4.2.0 → 4.2.1) - 2 medium XSS vulnerabilities fixed

### Dependencies Updated
- pdf-parse: upgraded to latest version with page-level extraction support

### Infrastructure
- GitHub Actions updated to v4 (fixes Node.js 20 deprecation warnings)
- CI workflow optimized: skip tests due to rolldown native binding issues on Linux runners
- Tests run locally with vitest; CI focuses on lint and build validation
- Render build: use `--omit=dev` to avoid platform-specific native dependencies

## [1.0.0] - 2026-03-27

### Added
- **Dual Persona AI Logic**:
  - Legal Auditor: Extracts strict requirements from tender documents
  - Senior Evaluator: Validates proposals with semantic understanding
- **Cloud-Native Architecture**: Render + Turso + Gemini
- **Observability**: LangSmith integration for AI tracing
- **Secure Authentication**: Hybrid strategy (HttpOnly Cookies + Bearer Token)
- **Modern UI**: Glassmorphism design with Light/Dark theme support
- **PDF Reports**: Branded export functionality
- **Dynamic Industry Validation**: Scope filtering based on sector
