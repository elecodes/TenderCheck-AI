-- Database Schema for TenderCheck AI

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tenders (Analyses) table
CREATE TABLE IF NOT EXISTS tenders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
    document_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Requirements table (linked to a Tender)
CREATE TABLE IF NOT EXISTS requirements (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL, -- 'MANDATORY', 'OPTIONAL'
    confidence REAL DEFAULT 1.0,
    keywords TEXT, -- Store as JSON string or comma-separated
    page_number INTEGER,
    snippet TEXT,
    embedding BLOB, -- Vector embedding for semantic search (768 dimensions)
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
);

-- 4. Validation Results (linked to a Tender)
CREATE TABLE IF NOT EXISTS validation_results (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'MET', 'NOT_MET'
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
);

-- 5. Decision Log (Audit Trail)
CREATE TABLE IF NOT EXISTS decision_logs (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL,
    requirement_id TEXT NOT NULL,
    prompt_used TEXT,
    ai_response TEXT,
    model_version TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
); 
