
import { Assessment } from '@/lib/mockData';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { cosineSimilarity } from './vectorOperations';
import { preprocessText } from './textProcessing';
import { extractDurationFromQuery, extractTechSkillsFromQuery, extractTestTypesFromQuery } from './queryExtraction';
import { getQueryEmbedding } from './embeddingCache';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
  requiredSkills?: string[];
  forceEmbedding?: boolean;
}

const filterAssessments = (assessments: Assessment[], params: SearchParams, strict: boolean = true): Assessment[] => {
  console.log(`Filtering assessments with params (strict=${strict}):`, params);
  
  // If no strict filtering needed, return all
  if (!strict) {
    return assessments;
  }
  
  return assessments.filter(assessment => {
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    // Hard constraints that we always apply
    if (params.remote === true && !assessment.remote_support) return false;
    if (params.adaptive === true && !assessment.adaptive_support) return false;
    
    // Apply duration filter with buffer in non-strict mode
    if (params.maxDuration && params.maxDuration < 180) {
      const buffer = strict ? 1.1 : 1.5; // Allow 50% more time in relaxed mode
      if (assessment.assessment_length > (params.maxDuration * buffer)) return false;
    }
    
    // In strict mode, require test type match if specified
    if (strict && params.testTypes?.length && !params.testTypes.some(type => 
      assessment.test_type.some(t => 
        t.toLowerCase().includes(type.toLowerCase()) || 
        type.toLowerCase().includes(t.toLowerCase())
      )
    )) return false;
    
    // In strict mode, require at least one skill match if specified
    if (strict && params.requiredSkills?.length && !params.requiredSkills.some(skill => 
      assessmentText.includes(skill.toLowerCase())
    )) return false;
    
    return true;
  });
};

export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query, forceEmbedding, ...filters } = params;
  console.log('Performing vector search with query:', query, 'forceEmbedding:', forceEmbedding);
  
  try {
    const allAssessments = await loadAssessmentData();
    if (allAssessments.length === 0) {
      console.log('No assessments found in data source');
      return [];
    }
    
    const processedQuery = preprocessText(query);
    console.log('Processed query:', processedQuery);
    
    // Extract search parameters
    const extractedDuration = filters.maxDuration || extractDurationFromQuery(processedQuery);
    const extractedTestTypes = filters.testTypes?.length ? filters.testTypes : extractTestTypesFromQuery(processedQuery);
    const extractedSkills = filters.requiredSkills?.length ? filters.requiredSkills : extractTechSkillsFromQuery(processedQuery);
    
    const searchParams: SearchParams = {
      query: processedQuery,
      ...filters,
      maxDuration: extractedDuration,
      testTypes: extractedTestTypes,
      requiredSkills: extractedSkills,
    };
    
    // By default, return all assessments for empty queries instead of filtering
    if (!processedQuery.trim() && !forceEmbedding) {
      console.log('Empty query without force flag, returning all assessments without ranking');
      return allAssessments.slice(0, 20); // Return first 20 by default
    }
    
    // Try embedding-based search first if we have a query or force flag
    if ((processedQuery.trim() || forceEmbedding)) {
      try {
        // Get query embedding
        const queryEmbedding = await getQueryEmbedding(processedQuery || "all assessments");
        
        // Count how many assessments have embeddings
        const embeddingsCount = allAssessments.reduce((count, assessment) => 
          assessment.embedding ? count + 1 : count, 0);
        
        console.log(`${embeddingsCount} out of ${allAssessments.length} assessments have embeddings`);
        
        if (embeddingsCount > 0) {
          // Debug to track embedding formats
          console.log('Query embedding sample:', queryEmbedding.slice(0, 5));
          
          // Since assessments already have embeddings, we can directly use them
          const scoredAssessments = allAssessments
            .map(assessment => {
              if (!assessment.embedding) {
                return { assessment, similarity: 0 };
              }
              
              let embeddingArray: number[];
              
              // Handle different embedding formats
              if (typeof assessment.embedding === 'string') {
                try {
                  // Convert string to array, handling both formats with single or double quotes
                  const embeddingString = String(assessment.embedding);
                  embeddingArray = JSON.parse(embeddingString.replace(/'/g, '"'));
                } catch (e) {
                  console.log(`Error parsing embedding for assessment ID: ${assessment.id}`, e);
                  return { assessment, similarity: 0 };
                }
              } else {
                embeddingArray = assessment.embedding;
              }
              
              // Ensure the embedding is a valid array before calculating similarity
              if (!Array.isArray(embeddingArray)) {
                console.log(`Invalid embedding format for assessment ID: ${assessment.id}`);
                return { assessment, similarity: 0 };
              }
              
              const similarity = cosineSimilarity(queryEmbedding, embeddingArray);
              return { assessment, similarity };
            });
          
          // Use a much lower threshold since we want to show results
          const threshold = 0.01;
          
          // Get ranked results with a similarity score
          let rankedResults = scoredAssessments
            .filter(result => result.similarity > threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .map(result => result.assessment);
          
          // If no results pass the threshold, return top results regardless of score
          if (rankedResults.length === 0) {
            console.log('No results above similarity threshold, returning top matches regardless');
            rankedResults = scoredAssessments
              .sort((a, b) => b.similarity - a.similarity)
              .map(result => result.assessment)
              .slice(0, 20);
          }
          
          console.log(`Returning ${rankedResults.length} ranked results`);
          return rankedResults;
        }
      } catch (error) {
        console.error('Error during embedding ranking:', error);
        // Fall through to basic filtering if embedding ranking fails
      }
    }
    
    // Fallback to basic filtering if embedding search fails or isn't applicable
    console.log('Falling back to basic filtering');
    return allAssessments.slice(0, 20);
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
