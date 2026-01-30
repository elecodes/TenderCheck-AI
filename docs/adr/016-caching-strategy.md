# ADR 016: Global Caching Strategy

## Status
Accepted

## Date
2026-01-30

## Context
As the application scales, questions regarding data freshness and dashboard performance have arisen. Currently, the application fetches fresh data from the backend (Turso + Node.js) on every page load or component mount. We needed to decide whether to implement a caching layer (client-side or server-side) now or defer it.

## Decision
We have decided to **defer the implementation of a complex caching layer** and maintain a **Real-Time / Fetch-on-Mount** strategy for the current phase.

### Rationale
1.  **Simplicity**: The current traffic load (Single Tenant / Education Use) does not justify the complexity of cache invalidation logic.
2.  **Data Consistency**: Users must see the most up-to-date status of Tender Analysis. Stale data ("Optimistic UI") could lead to confusion regarding the "Completed" vs "Pending" status of an analysis.
3.  **Fast Backend**: The backend is hosted on Render with a lightweight SQLite (Turso) database, providing <200ms query times, which provides acceptable user experience without caching.

## Architecture
1.  **Browser Cache**: Standard Vite hashing for static assets (JS/CSS/Images).
2.  **Session Cache**: `localStorage` used strictly for JWT persistence and basic User Profile data.
3.  **Data Fetching**: Standard `useEffect` + `fetch` in React components.

## Future Actions (Performance Triggers)
We will introduce **TanStack Query (React Query)** or a similar server-state management library IF AND ONLY IF:
1.  **Dashboard Latency**: The "My Tenders" list takes longer than **800ms** to render.
2.  **Network Overhead**: We observe redundant duplicate requests for the same data within a 5-minute window.

**Proposed Implementation (Future)**:
```typescript
// Future Plan
const { data } = useQuery({
  queryKey: ['tenders'],
  queryFn: fetchTenders,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Consequences
*   **Positive**: Reduced codebase complexity; zero risk of stale data.
*   **Negative**: Slightly higher interaction cost (network request) on every navigation event.
