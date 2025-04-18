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
    
    if (!processedQuery.trim()) {
      console.log('Empty query, returning filtered assessments without ranking');
      return filteredAssessments.slice(0, 10);
    }
    
    try {
      // Get query embedding
      const queryEmbedding = await getQueryEmbedding(processedQuery);
      
      // Since assessments already have embeddings, we can directly use them
      const scoredAssessments = filteredAssessments
        .map(assessment => {
          if (!assessment['embedding']) {
            console.log(`No embedding found for assessment ID: ${assessment.id}`);
            return { assessment, similarity: 0 };
          }
          const similarity = cosineSimilarity(queryEmbedding, assessment['embedding']);
          return { assessment, similarity };
        });
      
      // Filter and sort by similarity
      const threshold = scoredAssessments.length < 5 ? 0.05 : 0.1;
      const rankedResults = scoredAssessments
        .filter(result => result.similarity > threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .map(result => result.assessment)
        .slice(0, 10);
      
      return rankedResults;
      
    } catch (error) {
      console.error('Error during embedding ranking:', error);
      return filteredAssessments.slice(0, 10);
    }
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
