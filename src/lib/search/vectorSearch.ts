
import { Assessment } from '@/lib/mockData';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { cosineSimilarity } from './vectorOperations';
import { preprocessText } from './textProcessing';
import { getQueryEmbedding } from './embeddingCache';

interface SearchParams {
  query: string;
}

export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query } = params;
  console.log('Performing vector search with query:', query);
  
  try {
    const allAssessments = await loadAssessmentData();
    if (allAssessments.length === 0) {
      console.log('No assessments found in data source');
      return [];
    }
    
    const processedQuery = preprocessText(query);
    console.log('Processed query:', processedQuery);
    
    if (!processedQuery.trim()) {
      console.log('Empty query, returning all assessments');
      return allAssessments.slice(0, 10);
    }
    
    try {
      const queryEmbedding = await getQueryEmbedding(processedQuery);
      
      // Count how many assessments have embeddings
      const embeddingsCount = allAssessments.reduce((count, assessment) => 
        assessment.embedding ? count + 1 : count, 0);
      
      console.log(`${embeddingsCount} out of ${allAssessments.length} assessments have embeddings`);
      
      // Score all assessments based on similarity
      const scoredAssessments = allAssessments
        .map(assessment => {
          if (!assessment.embedding) {
            return { assessment, similarity: 0 };
          }
          
          let embeddingArray: number[];
          
          if (typeof assessment.embedding === 'string') {
            try {
              embeddingArray = JSON.parse(String(assessment.embedding).replace(/'/g, '"'));
            } catch (e) {
              console.log(`Error parsing embedding for assessment ID: ${assessment.id}`, e);
              return { assessment, similarity: 0 };
            }
          } else {
            embeddingArray = assessment.embedding;
          }
          
          if (!Array.isArray(embeddingArray)) {
            console.log(`Invalid embedding format for assessment ID: ${assessment.id}`);
            return { assessment, similarity: 0 };
          }
          
          const similarity = cosineSimilarity(queryEmbedding, embeddingArray);
          console.log(`Similarity score for "${assessment.title}": ${similarity.toFixed(3)}`);
          return { assessment, similarity };
        });
      
      // Get ranked results
      return scoredAssessments
        .sort((a, b) => b.similarity - a.similarity)
        .map(result => result.assessment)
        .slice(0, 10);
      
    } catch (error) {
      console.error('Error during embedding ranking:', error);
      return allAssessments.slice(0, 10);
    }
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
