# ADR 009: Vector Search and Performance Optimization

**Status:** Accepted  
**Date:** 2026-01-27  
**Deciders:** Elena (TFM Author)

## Context

Proposal validation was taking 5+ minutes due to sequential LLM processing of all requirements. We needed to:
1. Reduce validation time significantly
2. Maintain 89% accuracy
3. Keep local-first architecture
4. Prepare for cloud deployment

## Decision

Implemented vector search infrastructure with parallel processing:

### 1. Vector Embeddings
- **Model:** `nomic-embed-text` (768 dimensions)
- **Storage:** SQLite BLOB column
- **Generation:** Pre-computed during tender analysis
- **Similarity:** Cosine similarity

### 2. Parallel Processing
- **Batch size:** 3 requirements per batch
- **Concurrency:** 3 batches simultaneously
- **Temperature:** 0.0 (deterministic results)

### 3. Vector Filtering
- **Status:** Disabled (hurts accuracy)
- **Infrastructure:** Ready for future optimization
- **Current:** Process all requirements

## Rationale

### What Worked ✅
- **Parallel processing:** 50% faster (5 min → 2-3 min)
- **Deterministic results:** Temperature 0.0 ensures consistency
- **Embedding infrastructure:** Ready for future use

### What Didn't Work ❌
- **Vector filtering:** Reduced accuracy (89% → 55-75%)
- **Similarity thresholds:** Too aggressive filtering missed important requirements

## Consequences

### Positive
- ✅ 50% performance improvement
- ✅ Consistent 89% accuracy
- ✅ Scalable architecture for cloud deployment
- ✅ Vector search ready for future optimization

### Negative
- ❌ Still ~2-3 minutes (CPU bottleneck)
- ❌ Vector filtering disabled (accuracy priority)
- ❌ Higher RAM usage (~7.5GB vs ~5.5GB)

## Alternatives Considered

### 1. Smaller Model
- **Option:** Use `mistral:7b-instruct-q4_0` (quantized)
- **Impact:** 2x faster, ~5-10% accuracy loss
- **Decision:** Rejected (accuracy priority)

### 2. Aggressive Vector Filtering
- **Option:** `MAX_RELEVANT_REQUIREMENTS = 3-5`
- **Impact:** 3-5x faster, 20-40% accuracy loss
- **Decision:** Rejected (unacceptable accuracy loss)

### 3. Cloud GPU Deployment
- **Option:** Hugging Face Spaces (FREE T4 GPU)
- **Impact:** 10x faster (~30 sec), configuration complexity
- **Decision:** Deferred (local sufficient for TFM)

## Implementation

### Configuration
```typescript
// constants.ts
export const MISTRAL_TEMPERATURE = 0.0; // Deterministic
export const BATCH_CHUNK_SIZE = 3; // Parallel batches
export const MAX_AI_CONCURRENCY = 3; // 3 batches at once
export const MAX_RELEVANT_REQUIREMENTS = 999; // Process all
export const SIMILARITY_THRESHOLD = 0.3; // Very permissive
```

### Files Modified
- `VectorSearchService.ts` (NEW)
- `schema.sql` (embedding column)
- `CreateTender.ts` (embedding generation)
- `ValidateProposal.ts` (parallel processing)
- `constants.ts` (configuration)

## Future Work

### Short-term
- Accept 2-3 min performance for TFM
- Document cloud deployment options
- Focus on thesis writing

### Long-term
- Deploy to Cloud Run (2x improvement)
- Optimize vector filtering for accuracy
- Deploy to GPU for 10x improvement

## Related ADRs
- ADR 003: AI Integration (Ollama + Mistral)
- ADR 005: Local Auth and Ollama
- ADR 008: Local SQL Persistence

## References
- [Vector Search Implementation](file:///Users/elena/TenderCheckAI/backend/src/infrastructure/services/VectorSearchService.ts)
- [Performance Analysis](file:///Users/elena/.gemini/antigravity/brain/997d7422-9770-4ebd-8921-f4bf2b9fbe68/speed_vs_accuracy.md)
- [Cloud Deployment Guide](file:///Users/elena/.gemini/antigravity/brain/997d7422-9770-4ebd-8921-f4bf2b9fbe68/cloud_deployment_guide.md)
