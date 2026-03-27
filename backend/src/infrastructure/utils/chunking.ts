export interface PageChunk {
  chunkIndex: number;
  startPage: number;
  endPage: number;
  totalPages: number;
  text: string;
}

export interface ChunkingOptions {
  pagesPerChunk: number;
  maxCharsPerChunk?: number;
}

export function chunkPages(
  pages: string[],
  options: ChunkingOptions,
): PageChunk[] {
  const { pagesPerChunk, maxCharsPerChunk = 500000 } = options;
  const chunks: PageChunk[] = [];
  const totalPages = pages.length;

  for (let i = 0; i < pages.length; i += pagesPerChunk) {
    const chunkPages = pages.slice(i, i + pagesPerChunk);
    const text = chunkPages.join("\n\n");

    const truncatedText =
      text.length > maxCharsPerChunk
        ? text.substring(0, maxCharsPerChunk)
        : text;

    chunks.push({
      chunkIndex: Math.floor(i / pagesPerChunk),
      startPage: i + 1,
      endPage: Math.min(i + pagesPerChunk, totalPages),
      totalPages,
      text: truncatedText,
    });
  }

  return chunks;
}

export function getTotalChunks(
  totalPages: number,
  pagesPerChunk: number,
): number {
  return Math.ceil(totalPages / pagesPerChunk);
}
