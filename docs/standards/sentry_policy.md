# 👁️ Sentry & Observability Policy - TenderCheck AI

## 1. Monitoring Objectives
[cite_start]To provide real-time visibility into the application's health, ensuring that every error is captured and every performance bottleneck is identified before it impacts the user.

## 2. Error Tracking Implementation
* [cite_start]**Global Boundary**: Implement Sentry error boundaries in the React frontend to catch rendering crashes.
* [cite_start]**Backend Middleware**: Use Sentry's request handlers in the Express backend to automatically capture 500-level errors and unhandled promise rejections[cite: 663].
* **Contextual Data**: Every captured error must include the `user_id` (if authenticated) and relevant tags like `analysis_id` to facilitate debugging.

## 3. Performance & Core Web Vitals
* [cite_start]**Transaction Tracking**: Monitor the latency of long-running processes, specifically PDF parsing and AI extraction steps.
* [cite_start]**User Perception**: Correlate technical metrics (LCP, FID, CLS) with the "perceived speed" of the application to ensure a smooth UX[cite: 664, 682].
* [cite_start]**Optimistic UI Validation**: Track instances where an "Optimistic UI" update requires a rollback due to a backend failure[cite: 209].

## 4. AI Specific Observability
* **LLM Telemetry**: Capture breadcrumbs for every AI prompt sent and response received to debug "hallucinations" or timeouts.
* **Token Usage & Cost**: (Optional) Use Sentry custom measurements to track token consumption per analysis.

## 5. Release & Alert Management
* **Environment Scoping**: Distinguish between `development`, `staging`, and `production` environments to keep alerts relevant.
* [cite_start]**Intelligent Alerts**: Configure Sentry to trigger alerts only for service degradations or high-frequency errors, avoiding "alert fatigue"[cite: 665].
* **Source Maps**: Integrate the CI/CD pipeline to upload source maps, ensuring that production stack traces point to the original TypeScript code.