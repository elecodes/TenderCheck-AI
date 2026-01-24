import type { ILegalDataSource, LegalCitation } from "../../domain/interfaces/ILegalDataSource.js";

export class MockLegalService implements ILegalDataSource {
  async citationSearch(query: string): Promise<LegalCitation[]> {
    console.log(`[MockLegalService] Searching for: "${query}"`);

    // Simple keyword matching for mock purposes
    const lowerQuery = query.toLowerCase();
    
    // Simulating LCSP (Ley de Contratos del Sector Público) knowledge
    const mockDb: LegalCitation[] = [
      {
        id: "art-100",
        article: "Artículo 100. Presupuesto base de licitación",
        text: "Para la determinación del presupuesto base de licitación, se tendrán en cuenta los costes directos e indirectos y otros eventuales gastos calculados para su ejecución...",
        relevance: 1.0,
        source: "LCSP"
      },
      {
        id: "art-149",
        article: "Artículo 149. Ofertas con valores anormales o desproporcionados",
        text: "La mesa de contratación deberá identificar las ofertas que se consideren anormales con arreglo a lo dispuesto en los pliegos...",
        relevance: 0.9,
        source: "LCSP"
      },
      {
        id: "art-75",
        article: "Artículo 75. Solvencia económica y financiera",
        text: "La solvencia económica y financiera del empresario deberá acreditarse por uno o varios de los medios siguientes...",
        relevance: 0.95,
        source: "LCSP"
      }
    ];

    if (lowerQuery.includes("presupuesto") || lowerQuery.includes("coste")) {
      const match = mockDb[0];
      return match ? [match] : [];
    }
    if (lowerQuery.includes("anormal") || lowerQuery.includes("baja")) {
        const match = mockDb[1];
        return match ? [match] : [];
    }
    if (lowerQuery.includes("solvencia") || lowerQuery.includes("financiera")) {
        const match = mockDb[2];
        return match ? [match] : [];
    }

    // Default return empty or generic if nothing matches
    return [];
  }
}
