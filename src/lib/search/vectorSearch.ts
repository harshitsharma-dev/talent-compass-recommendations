
import { Assessment } from '@/lib/mockData';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { cosineSimilarity } from './vectorOperations';
import { preprocessText } from './textProcessing';
import { 
  extractDurationFromQuery, 
  extractTechSkillsFromQuery, 
  extractTestTypesFromQuery 
} from './queryExtraction';
import { 
  generateAssessmentEmbeddings, 
  getQueryEmbedding, 
  preloadEmbeddings 
} from './embeddingCache';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
  requiredSkills?: string[];
}

// Filter assessments based on search parameters
const filterAssessments = (assessments: Assessment[], params: SearchParams): Assessment[] => {
  console.log('Filtering assessments with params:', params);
  
  return assessments.filter(assessment => {
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    if (params.remote === true && !assessment.remote_support) return false;
    if (params.adaptive === true && !assessment.adaptive_support) return false;
    if (params.maxDuration && assessment.assessment_length > (params.maxDuration * 1.1)) return false;
    
    // More flexible test type matching
    if (params.testTypes?.length && !params.testTypes.some(type => 
      assessment.test_type.some(t => t.toLowerCase().includes(type.toLowerCase()) || 
                                    type.toLowerCase().includes(t.toLowerCase()))
    )) return false;
    
    // More flexible skill matching
    if (params.requiredSkills?.length && !params.requiredSkills.some(skill => 
      assessmentText.includes(skill.toLowerCase())
    )) return false;
    
    return true;
  });
};

// Preload the assessment data and embeddings for faster searches
export const preloadAssessmentData = async (): Promise<void> => {
  try {
    const allAssessments = await loadAssessmentData();
    await preloadEmbeddings(allAssessments);
  } catch (error) {
    console.error('Failed to preload assessment data:', error);
  }
};

// Main search function
export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query, ...filters } = params;
  console.log('Performing vector search with query:', query);
  
  try {
    const allAssessments = await loadAssessmentData();
    if (allAssessments.length === 0) {
      console.log('No assessments found in data source');
      return [];
    }
    
    // Extract additional parameters from query if not explicitly provided
    const extractedDuration = filters.maxDuration || extractDurationFromQuery(query);
    const extractedTestTypes = filters.testTypes?.length ? filters.testTypes : extractTestTypesFromQuery(query);
    const extractedSkills = filters.requiredSkills?.length ? filters.requiredSkills : extractTechSkillsFromQuery(query);
    
    // Include query in searchParams
    const searchParams: SearchParams = {
      query,
      ...filters,
      maxDuration: extractedDuration,
      testTypes: extractedTestTypes,
      requiredSkills: extractedSkills,
    };
    
    console.log('Search parameters:', JSON.stringify(searchParams, null, 2));
    
    // Filter assessments
    const filteredAssessments = filterAssessments(allAssessments, searchParams);
    console.log(`Filtered to ${filteredAssessments.length} assessments`);
    
    if (filteredAssessments.length === 0) {
      console.log('No assessments passed the filters');
      
      // If no results after strict filtering, try with only the query text for semantic search
      if (Object.keys(filters).length > 0 || extractedTestTypes.length > 0 || extractedSkills.length > 0) {
        console.log('Attempting relaxed search with just the query text');
        return performVectorSearch({ query });
      }
      
      return [];
    }
    
    if (!query.trim()) {
      console.log('Empty query, returning filtered assessments without ranking');
      return filteredAssessments.slice(0, 10);
    }
    
    // Compute similarity scores
    const queryEmbedding = await getQueryEmbedding(query);
    const assessmentEmbeddings = await generateAssessmentEmbeddings(filteredAssessments);
    
    console.log('Ranking assessments by similarity to query');
    const rankedResults = filteredAssessments
      .map(assessment => {
        const embedding = assessmentEmbeddings[assessment.id];
        if (!embedding) {
          console.warn(`Missing embedding for assessment ID: ${assessment.id}`);
          return { assessment, similarity: 0 };
        }
        return {
          assessment,
          similarity: cosineSimilarity(queryEmbedding, embedding)
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .map(result => result.assessment)
      .slice(0, 10);
    
    console.log(`Returning ${rankedResults.length} ranked results`);
    return rankedResults;
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
