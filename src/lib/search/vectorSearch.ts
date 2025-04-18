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

const filterAssessments = (assessments: Assessment[], params: SearchParams): Assessment[] => {
  console.log('Filtering assessments with params:', params);
  
  return assessments.filter(assessment => {
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    if (params.remote === true && !assessment.remote_support) return false;
    if (params.adaptive === true && !assessment.adaptive_support) return false;
    if (params.maxDuration && assessment.assessment_length > (params.maxDuration * 1.1)) return false;
    
    if (params.testTypes?.length && !params.testTypes.some(type => 
      assessment.test_type.some(t => t.toLowerCase().includes(type.toLowerCase()) || 
                                    type.toLowerCase().includes(t.toLowerCase()))
    )) return false;
    
    if (params.requiredSkills?.length && !params.requiredSkills.some(skill => 
      assessmentText.includes(skill.toLowerCase())
    )) return false;
    
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
    
    const filteredAssessments = filterAssessments(allAssessments, searchParams);
    console.log(`Filtered to ${filteredAssessments.length} assessments`);
    
    if (filteredAssessments.length === 0) {
      console.log('No assessments passed the filters');
      if (Object.keys(filters).length > 0 || extractedTestTypes.length > 0 || extractedSkills.length > 0) {
        console.log('Attempting relaxed search with just the query text');
        return performVectorSearch({ query });
      }
      return [];
    }
    
    if (!processedQuery.trim()) {
      console.log('Empty query, returning filtered assessments without ranking');
      return filteredAssessments.slice(0, 10);
    }
    
    const queryEmbedding = await getQueryEmbedding(processedQuery);
    const assessmentEmbeddings = await generateAssessmentEmbeddings(filteredAssessments);
    
    console.log('Ranking assessments by embedding similarity');
    const rankedResults = filteredAssessments
      .map(assessment => {
        const embedding = assessmentEmbeddings[assessment.id];
        if (!embedding) {
          console.warn(`Missing embedding for assessment ID: ${assessment.id}`);
          return { assessment, similarity: 0 };
        }
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        console.log(`Similarity score for ${assessment.title}: ${similarity}`);
        return { assessment, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .filter(result => result.similarity > 0.1)
      .map(result => result.assessment)
      .slice(0, 10);
    
    console.log(`Returning ${rankedResults.length} ranked results`);
    return rankedResults;
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
