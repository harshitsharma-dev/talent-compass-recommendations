
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

// Add this declaration to extend the Assessment interface
declare module '@/lib/mockData' {
  interface Assessment {
    embedding?: number[] | null;
  }
}
