# ADR 008: Local SQL Persistence (SQLite)

## Status
Accepted

## Context
Initially, the application used in-memory repositories for prototyping. This approach was volatile, meaning all data (users, tenders, requirements) was lost whenever the server restarted. To support a "History" feature and a persistent user experience as required for Phase 14, we needed a permanent storage solution.

## Decision
We have decided to implement **SQLite** using the `better-sqlite3` driver for the following reasons:
1. **Local-First Architecture**: Aligns with our goal of "Privacy by Default" and Local AI (Ollama). Data stays on the user's machine.
2. **Zero Maintenance**: No server installation is required; the database is a single file (`database.sqlite`).
3. **No Cost**: Zero infrastructure costs, making it ideal for a TFM project.
4. **Reliability**: `better-sqlite3` is synchronous and highly performant for the expected load of this application.

## Consequences
- **Schema Management**: We use a `schema.sql` file to initialize the database structure (Users, Tenders, Requirements, ValidationResults).
- **Concurrency**: SQLite handles multiple readers well, but only one concurrent writer. This is acceptable for a local/single-user desktop-like tool.
- **Backups**: Backing up data is as simple as copying the `.sqlite` file.
- **Repository Pattern**: We refactored `InMemoryTenderRepository` to `SqliteTenderRepository`, maintaining the `ITenderRepository` interface to minimize domain impact.

## Database Schema
```sql
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT, password_hash TEXT, ...);
CREATE TABLE tenders (id TEXT PRIMARY KEY, user_id TEXT, title TEXT, ...);
CREATE TABLE requirements (id TEXT PRIMARY KEY, tender_id TEXT, text TEXT, ...);
CREATE TABLE validation_results (id TEXT PRIMARY KEY, tender_id TEXT, status TEXT, message TEXT, ...);
```
