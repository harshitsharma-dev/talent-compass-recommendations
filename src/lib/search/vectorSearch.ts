
import { Assessment } from '@/lib/mockData';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { preprocessText } from './textProcessing';
import { getQueryEmbedding } from './embeddingCache';
import { countAssessmentsWithEmbeddings } from './handlers/embeddingHandler';
import { scoreAssessments, rankAssessments } from './services/similarityService';

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
      
      const embeddingsCount = countAssessmentsWithEmbeddings(allAssessments);
      console.log(`${embeddingsCount} out of ${allAssessments.length} assessments have embeddings`);
      
      const scoredAssessments = scoreAssessments(allAssessments, queryEmbedding);
      return rankAssessments(scoredAssessments);
      
    } catch (error) {
      console.error('Error during embedding ranking:', error);
      return allAssessments.slice(0, 10);
    }
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
