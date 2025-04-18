
import { Assessment } from '@/lib/mockData';
import { EmbeddingCache } from '@/types/search';

export const parseEmbedding = (embedding: any): number[] | null => {
  if (!embedding) return null;
  
  try {
    // Case 1: Already a number array
    if (Array.isArray(embedding) && embedding.length > 0 && typeof embedding[0] === 'number') {
      return embedding;
    }
    
    // Case 2: JSONB object from database
    if (typeof embedding === 'object' && !Array.isArray(embedding)) {
      // Try to convert object to string and parse
      const embeddingStr = JSON.stringify(embedding);
      try {
        const parsed = JSON.parse(embeddingStr.replace(/'/g, '"'));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(val => Number(val));
        }
      } catch (e) {
        console.warn('Failed to parse embedding object:', e);
      }
    }
    
    // Case 3: String representation of array
    if (typeof embedding === 'string') {
      try {
        const parsed = JSON.parse(embedding.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          return parsed.map(val => Number(val));
        }
      } catch (e) {
        console.warn('Failed to parse embedding string:', e);
      }
    }
    
    console.warn('Unknown embedding format:', typeof embedding);
    return null;
  } catch (err) {
    console.warn('Failed to parse embedding:', err);
    return null;
  }
};

export const validateEmbedding = (embedding: any): embedding is number[] => {
  return Array.isArray(embedding) && 
         embedding.length > 0 && 
         typeof embedding[0] === 'number';
};

export const countAssessmentsWithEmbeddings = (assessments: Assessment[]): number => {
  return assessments.reduce((count, assessment) => 
    assessment.embedding ? count + 1 : count, 0
  );
};
