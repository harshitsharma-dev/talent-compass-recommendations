
import { Assessment } from '@/lib/mockData';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { cosineSimilarity } from './vectorOperations';
import { preprocessText } from './textProcessing';
import { 
  extractDurationFromQuery, 
  extractTechSkillsFromQuery, 
  extractTestTypesFromQuery 
} from './queryExtraction';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
  requiredSkills?: string[];
}

// Cache for assessment embeddings
let assessmentEmbeddings: { [key: string]: number[] } = {};

// Get embedding for a search query
const getQueryEmbedding = async (query: string): Promise<number[]> => {
  try {
    const processedQuery = preprocessText(query);
    console.log('Getting embedding for processed query:', processedQuery);
    
    const embeddingResult = await getEmbeddings([processedQuery]);
    return embeddingResult.data[0];
  } catch (error) {
    console.error('Error getting query embedding:', error);
    throw error;
  }
};

// Get embeddings for all assessments
const getAssessmentEmbeddings = async (assessments: Assessment[]): Promise<{ [key: string]: number[] }> => {
  if (Object.keys(assessmentEmbeddings).length > 0) {
    return assessmentEmbeddings;
  }

  try {
    console.log('Generating embeddings for assessments...');
    const texts = assessments.map(a => 
      preprocessText(
        `${a.title} ${a.title} ${a.description} ${a.description} ` + 
        `Test types: ${a.test_type.join(', ')} ${a.test_type.join(', ')} ` + 
        `Job levels: ${a.job_levels.join(', ')} ` + 
        `Duration: ${a.assessment_length} minutes ` +
        `${a.remote_support ? 'Remote testing supported' : ''} ` +
        `${a.adaptive_support ? 'Adaptive testing supported' : ''}`
      )
    );
    
    const embeddings = await getEmbeddings(texts);
    assessmentEmbeddings = assessments.reduce((acc, assessment, index) => {
      acc[assessment.id] = embeddings.data[index];
      return acc;
    }, {} as { [key: string]: number[] });

    return assessmentEmbeddings;
  } catch (error) {
    console.error('Error generating assessment embeddings:', error);
    throw error;
  }
};

// Filter assessments based on search parameters
const filterAssessments = (assessments: Assessment[], params: SearchParams): Assessment[] => {
  return assessments.filter(assessment => {
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    if (params.remote === true && !assessment.remote_support) return false;
    if (params.adaptive === true && !assessment.adaptive_support) return false;
    if (params.maxDuration && assessment.assessment_length > (params.maxDuration * 1.1)) return false;
    
    if (params.testTypes?.length && !params.testTypes.some(type => 
      assessment.test_type.some(t => t.toLowerCase().includes(type.toLowerCase()))
    )) return false;
    
    if (params.requiredSkills?.length && !params.requiredSkills.some(skill => 
      assessmentText.includes(skill.toLowerCase())
    )) return false;
    
    return true;
  });
};

// Main search function
export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query, ...filters } = params;
  console.log('Performing vector search with query:', query);
  
  try {
    const allAssessments = await loadAssessmentData();
    if (allAssessments.length === 0) return [];
    
    // Extract additional parameters from query if not explicitly provided
    const extractedDuration = filters.maxDuration || extractDurationFromQuery(query);
    const extractedTestTypes = filters.testTypes?.length ? filters.testTypes : extractTestTypesFromQuery(query);
    const extractedSkills = extractTechSkillsFromQuery(query);
    
    const searchParams = {
      ...filters,
      maxDuration: extractedDuration,
      testTypes: extractedTestTypes,
      requiredSkills: extractedSkills,
    };
    
    // Filter assessments
    const filteredAssessments = filterAssessments(allAssessments, searchParams);
    
    if (query.trim()) {
      // Compute similarity scores
      const queryEmbedding = await getQueryEmbedding(query);
      const assessmentEmbeddings = await getAssessmentEmbeddings(filteredAssessments);
      
      return filteredAssessments
        .map(assessment => ({
          assessment,
          similarity: cosineSimilarity(queryEmbedding, assessmentEmbeddings[assessment.id])
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .map(result => result.assessment)
        .slice(0, 10);
    }
    
    return filteredAssessments.slice(0, 10);
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
};
