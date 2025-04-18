
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
