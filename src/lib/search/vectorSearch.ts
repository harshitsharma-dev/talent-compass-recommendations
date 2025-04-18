
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
}

const filterAssessments = (assessments: Assessment[], params: SearchParams, strict: boolean = true): Assessment[] => {
  console.log(`Filtering assessments with params (strict=${strict}):`, params);
  
  return assessments.filter(assessment => {
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    // Hard constraints that we always apply
    if (params.remote === true && !assessment.remote_support) return false;
    if (params.adaptive === true && !assessment.adaptive_support) return false;
    
    // Apply duration filter with buffer in non-strict mode
    if (params.maxDuration) {
      const buffer = strict ? 1.1 : 1.5; // Allow 50% more time in relaxed mode
      if (assessment.assessment_length > (params.maxDuration * buffer)) return false;
    }
    
    // In strict mode, require test type match
    if (strict && params.testTypes?.length && !params.testTypes.some(type => 
      assessment.test_type.some(t => 
        t.toLowerCase().includes(type.toLowerCase()) || 
        type.toLowerCase().includes(t.toLowerCase())
      )
    )) return false;
    
    // In non-strict mode, test types are preferred but not required
    
    // In strict mode, require at least one skill match
    if (strict && params.requiredSkills?.length && !params.requiredSkills.some(skill => 
      assessmentText.includes(skill.toLowerCase())
    )) return false;
    
    // In non-strict mode, skills are preferred but not required
    
    return true;
  });
};

export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query, ...filters } = params;
  console.log('Performing vector search with query:', query);
  
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
    
    // First, try strict filtering
    let filteredAssessments = filterAssessments(allAssessments, searchParams, true);
    
    // If no results with strict filtering, try relaxed filtering
    if (filteredAssessments.length === 0) {
      console.log('No results with strict filtering, trying relaxed filtering');
      filteredAssessments = filterAssessments(allAssessments, searchParams, false);
    }
    
    if (!processedQuery.trim()) {
      console.log('Empty query, returning filtered assessments without ranking');
      return filteredAssessments.slice(0, 10);
    }
    
    try {
      // Get query embedding
      const queryEmbedding = await getQueryEmbedding(processedQuery);
      
      // Count how many assessments have embeddings
      const embeddingsCount = filteredAssessments.reduce((count, assessment) => 
        assessment.embedding ? count + 1 : count, 0);
      
      console.log(`${embeddingsCount} out of ${filteredAssessments.length} filtered assessments have embeddings`);
      
      // If less than 25% of assessments have embeddings, fall back to text-based ranking
      if (embeddingsCount < filteredAssessments.length * 0.25) {
        console.log('Too few embeddings available, using text-based ranking instead');
        
        // Simple text matching ranking
        const rankedResults = filteredAssessments
          .map(assessment => {
            const titleMatch = assessment.title.toLowerCase().includes(processedQuery.toLowerCase()) ? 5 : 0;
            const descMatch = assessment.description.toLowerCase().includes(processedQuery.toLowerCase()) ? 3 : 0;
            const typeMatch = assessment.test_type.some(t => t.toLowerCase().includes(processedQuery.toLowerCase())) ? 4 : 0;
            const score = titleMatch + descMatch + typeMatch;
            return { assessment, score };
          })
          .sort((a, b) => b.score - a.score)
          .map(result => result.assessment)
          .slice(0, 10);
        
        return rankedResults.length > 0 ? rankedResults : filteredAssessments.slice(0, 10);
      }
      
      // Debug to track embedding formats
      console.log('Query embedding sample:', queryEmbedding.slice(0, 5));
      let embeddingFormats = new Set();
      filteredAssessments.slice(0, 5).forEach(a => {
        if (a.embedding) {
          embeddingFormats.add(typeof a.embedding);
          if (Array.isArray(a.embedding)) {
            console.log(`Sample assessment embedding (array): ${a.id}`, a.embedding.slice(0, 5));
          }
        }
      });
      console.log('Embedding formats found:', Array.from(embeddingFormats));
      
      // Since assessments already have embeddings, we can directly use them
      const scoredAssessments = filteredAssessments
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
          console.log(`Similarity score for "${assessment.title}": ${similarity.toFixed(3)}`);
          return { assessment, similarity };
        });
      
      // Lower threshold if we have few results with embeddings
      const threshold = embeddingsCount < 10 ? 0.01 : 0.05;
      
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
          .slice(0, 10);
      }
      
      return rankedResults.slice(0, 10);
      
    } catch (error) {
      console.error('Error during embedding ranking:', error);
      return filteredAssessments.slice(0, 10);
    }
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
