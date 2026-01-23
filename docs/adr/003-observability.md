# ADR 003: Observability & Resilience Strategy

* Status: accepted
* Deciders: Elena, Senior Observability Engineer
* Date: 2026-01-23

## Context and Problem Statement
In production, silent failures (e.g., PDF parsing errors, AI timeouts) destroy user trust. We need a way to track, diagnose, and resolve errors without relying on user reports.

## Decision Drivers
* **Visibility**: We need to see what happened *before* the crash.
* **Full Stack**: Errors often span across Frontend (Network Error) and Backend (500).

## Considered Options
* **Console Logs**: Basic, standard output.
* **ELK Stack**: Elastic Search, Logstash, Kibana (Self-hosted).
* **Sentry**: SaaS Error Tracking.

## Decision Outcome
Chosen option: **"Sentry"**.

### Justification
* **Zero-Config**: `@sentry/node` and `@sentry/react` auto-instrument express and react components.
* **Context**: Sentry captures the "Breadcrumbs" (actions leading to error), which is critical for debugging AI hallucinations or state issues.
* **Performance**: Free tier includes basic performance monitoring (transactions).

### Positive Consequences
* Real-time alerting.
* Stack traces are preserved (with source maps).

### Negative Consequences
* Dependency on external SaaS.
