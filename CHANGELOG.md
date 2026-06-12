# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-12

### Changed
- **Google OAuth PKCE Migration**: Upgraded from Implicit Grant (`#access_token`) to Authorization Code + PKCE (`?code=`). Eliminates access token exposure in the browser URL. Frontend generates `code_verifier` and `code_challenge`, backend exchanges the code server-side with `GOOGLE_CLIENT_SECRET`. See ADR 040.

### Removed
- **Legacy Hash Parsing**: Removed `#access_token` hash parsing from `AuthContext`. Cleaned up `loginWithGoogle` from `auth.service.ts`.

## [1.2.0] - 2026-06-12

### Added
- **Clickable Citations**: Users can click any "Pág. X" badge on extracted requirements to see the full source document page with the AI-identified fragment highlighted. Backend now sends page-marked text to Gemini with structured `pageNumber` + `sourceText` fields. Frontend `CitationPreview` modal renders page text with highlighted snippet. See ADR 039.

### Changed
- **Chunking**: Page markers (`--- PAGE X ---`) are now embedded in chunk text instead of plain joins, enabling the AI to identify the exact page for each requirement.
- **Analysis Pipeline**: `processStandardPdf` now calls `parsePages()` and preserves `pageTexts` in the response.

## [1.1.0] - 2026-04-18

### Added
- **Production Subdomain**: Configured `https://tendercheckai.elecodes.online` on Vercel.
- **Vercel Deployment**: Migrated frontend hosting from local/preview to production Vercel.
- **Security ADR**: Documented transitive vulnerability remediation in ADR 037.
- **Deployment Documentation**: Added custom domain aliasing notes to PLAYBOOK.md.

### Fixed
- **Security**: Forced `protobufjs@7.5.5` to remediate critical vulnerability `GHSA-xq3m-2v4x-88gg`.
- **CORS**: Updated `ALLOWED_ORIGINS` to include the new production subdomain.
- **Google OAuth**: Fixed redirect flow to support Vercel's production URL.

### Changed
- **README**: Updated with production badges and live URL.
