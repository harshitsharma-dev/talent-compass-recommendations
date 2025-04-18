
import { Assessment } from '@/lib/mockData';

export interface SearchFilters {
  remote: boolean;
  adaptive: boolean;
  maxDuration: number;
  testTypes: string[];
  requiredSkills: string[];
}

export interface SearchResult {
  assessment: Assessment;
  similarityScore: number;
  matchedSkills: string[];
}

export interface EmbeddingCache {
  [key: string]: number[];
}

// Define the raw database response type
export interface AssessmentRow {
  "Test Title"?: string;
  "Assessment Length"?: string;
  "Test Type"?: string;
  "Remote Testing"?: string;
  "Adaptive/IRT"?: string;
  "Job Levels"?: string;
  Languages?: string;
  Link?: string;
  Description?: string;
  Downloads?: string;
  embedding?: any;
  combined_text?: string;
}

// Add this declaration to extend the Assessment interface
declare module '@/lib/mockData' {
  interface Assessment {
    embedding?: number[] | null;
    id: string;
  }
}
