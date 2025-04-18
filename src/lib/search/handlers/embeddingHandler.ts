
import { Assessment } from '@/lib/mockData';
import { EmbeddingCache } from '@/types/search';

export const parseEmbedding = (embedding: string | number[] | null | unknown): number[] | null => {
  if (!embedding) return null;
  
  try {
    if (Array.isArray(embedding)) {
      return embedding;
    }
    
    if (typeof embedding === 'object') {
      // Try to extract array from jsonb or other object formats
      const embeddingStr = JSON.stringify(embedding);
      if (embeddingStr) {
        return JSON.parse(embeddingStr.replace(/'/g, '"'));
      }
    }
    
    if (typeof embedding === 'string') {
      return JSON.parse(embedding.replace(/'/g, '"'));
    }
    
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
