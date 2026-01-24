
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

export class LocalEmbeddingService {
  private static instance: LocalEmbeddingService;
  private extractor: FeatureExtractionPipeline | null = null;
  private readonly MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

  private constructor() {}

  public static getInstance(): LocalEmbeddingService {
    if (!LocalEmbeddingService.instance) {
      LocalEmbeddingService.instance = new LocalEmbeddingService();
    }
    return LocalEmbeddingService.instance;
  }

  private async getExtractor() {
    if (!this.extractor) {
      console.log(`[LocalEmbeddingService] Loading model ${this.MODEL_NAME}...`);
      this.extractor = await pipeline('feature-extraction', this.MODEL_NAME, {
        quantized: false, // Optional: true for smaller/faster, false for better accuracy
      });
      console.log(`[LocalEmbeddingService] Model loaded.`);
    }
    return this.extractor;
  }

  /**
   * Generates embeddings for a generic string or array of strings.
   * Note: The model pipeline usually handles array of inputs efficiently.
   */
  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const extractor = await this.getExtractor();
    
    // Process sequentially or in batch depending on pipeline capabilities.
    // transformers.js pipeline can take an array, but returns a generic Tensor output.
    // We'll iterate to be safe and consistent with the expected number[][] format.
    
    const results: number[][] = [];

    // Simple sequential generation (could be optimized for batching if needed)
    for (const text of texts) {
        // "mean_pooling" is equivalent to taking the average of the CLS or all tokens? 
        // For 'feature-extraction', default output has dimensions [1, sequence_length, hidden_size]
        // Usually creating sentence embeddings involves pooling or using the CLS token.
        // pass pooling: 'mean', normalize: true to the pipeline call
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        
        // Output is a Tensor object. We need the data array.
        // .data is a Float32Array
        results.push(Array.from(output.data as Float32Array));
    }

    return results;
  }
}
