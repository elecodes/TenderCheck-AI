# 25. Enforce HTTPS for Turso (LibSQL)

Date: 2026-03-04

## Status

Accepted

## Context

The application experienced "500 Internal Server Error" responses during Google Login and other database-intensive operations when deployed to Render (Serverless/PaaS env) and even occasionally in local development. 

The root cause was identified as `LibsqlError: SQLITE_UNKNOWN: SQLite error: connection not opened`. The application was using the `libsql://` protocol, which establishes a WebSocket connection. In serverless environments (like Render) or during "Scale to Zero" wake-ups, the persistent WebSocket connection was either failing to establish quickly enough or dropping silently, leading to "Connection not opened" errors when the application attempted to execute queries.

## Decision

We have decided to **enforce the HTTPS protocol** for all Turso database connections in the `TursoDatabase.ts` singleton.

If the `TURSO_DB_URL` environment variable is provided as `libsql://...`, the application now automatically replaces the protocol scheme with `https://` before creating the client.

## Consequences

### Positive
*   **Reliability**: HTTP is stateless. Each query is a standalone request. This eliminates "connection invalid" or "socket hung up" errors caused by idle timeouts or serverless freezes.
*   **Simplicity**: Deployment configuration is robust; it works regardless of whether the user copies the `libsql` or `https` URL from the Turso dashboard.

### Negative
*   **Performance**: HTTP requests may have slightly higher overhead (handshake) compared to a persistent WebSocket connection for high-throughput streaming. However, for a generic CRUD application like TenderCheck AI, this impact is negligible and worth the stability gain.
*   **No Interactive Transactions**: The HTTP protocol in `@libsql/client` has limitations regarding interactive transactions compared to WebSockets, but our current usage fits within standard transaction boundaries supported by the HTTP client.

## References

*   [Turso Documentation: Protocols](https://docs.turso.tech/sdk/ts/reference#supported-protocols)
*   [GitHub Issue: LibsqlError connection not opened](https://github.com/tursodatabase/libsql-client-ts/issues/...)
