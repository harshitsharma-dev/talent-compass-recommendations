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

export const preloadAssessmentData = async (): Promise<void> => {
  try {
    const allAssessments = await loadAssessmentData();
    await preloadEmbeddings(allAssessments);
  } catch (error) {
    console.error('Failed to preload assessment data:', error);
  }
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
    
    console.log('Search parameters:', JSON.stringify(searchParams, null, 2));
    
    // First, try strict filtering
    let filteredAssessments = filterAssessments(allAssessments, searchParams, true);
    console.log(`Strict filtering returned ${filteredAssessments.length} assessments`);
    
    // If strict filtering gives no results, fall back to relaxed filtering
    if (filteredAssessments.length === 0) {
      console.log('No strict matches found, trying relaxed filtering');
      filteredAssessments = filterAssessments(allAssessments, searchParams, false);
      console.log(`Relaxed filtering returned ${filteredAssessments.length} assessments`);
      
      // If still no results, try with minimal constraints
      if (filteredAssessments.length === 0) {
        console.log('No relaxed matches found, trying minimal filtering');
        const minimalParams: SearchParams = {
          query: processedQuery,
          // Keep only hard constraints if any
          remote: filters.remote,
          adaptive: filters.adaptive,
        };
        filteredAssessments = filterAssessments(allAssessments, minimalParams, false);
        console.log(`Minimal filtering returned ${filteredAssessments.length} assessments`);
      }
    }
    
    if (filteredAssessments.length === 0) {
      console.log('All filtering attempts returned no results');
      return [];
    }
    
    if (!processedQuery.trim()) {
      console.log('Empty query, returning filtered assessments without ranking');
      return filteredAssessments.slice(0, 10);
    }
    
    try {
      // Try to get embeddings and rank results
      const queryEmbedding = await getQueryEmbedding(processedQuery);
      const assessmentEmbeddings = await generateAssessmentEmbeddings(filteredAssessments);
      
      console.log('Ranking assessments by embedding similarity');
      
      // Pair assessments with their similarity scores
      const scoredAssessments = filteredAssessments
        .map(assessment => {
          const embedding = assessmentEmbeddings[assessment.id];
          if (!embedding) {
            console.log(`No embedding for assessment ID: ${assessment.id}, title: "${assessment.title}"`);
            return { assessment, similarity: 0 };
          }
          const similarity = cosineSimilarity(queryEmbedding, embedding);
          return { assessment, similarity };
        });
      
      // Log similarity distribution to help with debugging
      if (scoredAssessments.length > 0) {
        const scores = scoredAssessments.map(item => item.similarity).sort((a, b) => b - a);
        console.log(`Similarity score range: ${scores[scores.length-1].toFixed(2)} to ${scores[0].toFixed(2)}`);
      }
      
      // Filter by minimum similarity score (lower threshold for minimal matches)
      const threshold = scoredAssessments.length < 5 ? 0.05 : 0.1;
      console.log(`Using similarity threshold: ${threshold}`);
      
      const rankedResults = scoredAssessments
        .filter(result => result.similarity > threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .map(result => result.assessment)
        .slice(0, 10);
      
      console.log(`Returning ${rankedResults.length} ranked results`);
      return rankedResults;
      
    } catch (error) {
      // Fallback if embedding ranking fails
      console.error('Error during embedding ranking:', error);
      console.log('Returning unranked filtered assessments as fallback');
      return filteredAssessments.slice(0, 10);
    }
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
