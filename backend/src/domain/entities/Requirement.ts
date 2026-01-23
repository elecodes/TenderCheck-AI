export type RequirementType = 'MANDATORY' | 'OPTIONAL' | 'UNKNOWN';

export interface Requirement {
  id: string;
  text: string; // The raw text of the requirement
  normalizedText?: string; // Cleaned up text for processing
  type: RequirementType;
  
  // Location in the original tender document
  source: {
    pageNumber: number;
    paragraph?: number;
    snippet: string; // Context around the requirement
  };
  
  // Keywords extracted for matching
  keywords: string[];
  
  // AI-generated confidence that this is indeed a requirement
  confidence: number; // 0.0 to 1.0
}
