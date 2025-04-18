
import { Assessment } from '@/lib/mockData';
import { cosineSimilarity } from '../vectorOperations';
import { parseEmbedding, validateEmbedding } from '../handlers/embeddingHandler';

interface ScoredAssessment {
  assessment: Assessment;
  similarity: number;
}

export const scoreAssessments = (assessments: Assessment[], queryEmbedding: number[]): ScoredAssessment[] => {
  return assessments.map(assessment => {
    if (!assessment.embedding) {
      return { assessment, similarity: 0 };
    }
    
    const embeddingArray = parseEmbedding(assessment.embedding);
    
    if (!embeddingArray || !validateEmbedding(embeddingArray)) {
      console.log(`Invalid embedding format for assessment ID: ${assessment.id}`);
      return { assessment, similarity: 0 };
    }
    
    const similarity = cosineSimilarity(queryEmbedding, embeddingArray);
    console.log(`Similarity score for "${assessment.title}": ${similarity.toFixed(3)}`);
    
    return { assessment, similarity };
  });
};

export const rankAssessments = (scoredAssessments: ScoredAssessment[]): Assessment[] => {
  return scoredAssessments
    .sort((a, b) => b.similarity - a.similarity)
    .map(result => result.assessment)
    .slice(0, 10);
};
