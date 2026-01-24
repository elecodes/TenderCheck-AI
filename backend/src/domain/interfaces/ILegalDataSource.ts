export type LegalCitation = {
  id: string;
  article: string;
  text: string;
  relevance: number; // 0 to 1
  source: string; // e.g. "LCSP", "Pliego"
};

export interface ILegalDataSource {
  /**
   * Semantically searches for legal articles related to a query.
   * @param query - e.g., "Es legal pedir una fianza del 50%?"
   * @returns List of relevant articles from LCSP.
   */
  citationSearch(query: string): Promise<LegalCitation[]>;
}
