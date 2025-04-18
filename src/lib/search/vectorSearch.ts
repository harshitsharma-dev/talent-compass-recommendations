
import { Assessment } from '@/lib/mockData';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { cosineSimilarity } from './vectorOperations';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
}

// Cache for assessment embeddings
let assessmentEmbeddings: { [key: string]: number[] } = {};

// Get embedding for a search query
const getQueryEmbedding = async (query: string): Promise<number[]> => {
  console.log('Getting embedding for query:', query);
  const embedding = await getEmbeddings([query]);
  return Array.from(embedding.data);
};

// Get embeddings for all assessments
const getAssessmentEmbeddings = async (assessments: Assessment[]): Promise<{ [key: string]: number[] }> => {
  const cached = Object.keys(assessmentEmbeddings).length;
  if (cached > 0) {
    console.log(`Using ${cached} cached assessment embeddings`);
    return assessmentEmbeddings;
  }

  console.log('Generating embeddings for assessments...');
  const texts = assessments.map(a => `${a.title} ${a.description}`);
  const embeddings = await getEmbeddings(texts);
  
  assessmentEmbeddings = assessments.reduce((acc, assessment, index) => {
    acc[assessment.id] = Array.from(embeddings.data[index]);
    return acc;
  }, {} as { [key: string]: number[] });

  console.log(`Generated embeddings for ${assessments.length} assessments`);
  return assessmentEmbeddings;
};

// Filter assessments based on search parameters
const filterAssessments = (
  assessments: Assessment[],
  { remote, adaptive, maxDuration, testTypes }: Partial<SearchParams>
): Assessment[] => {
  return assessments.filter(assessment => {
    if (remote !== undefined && assessment.remote_support !== remote) return false;
    if (adaptive !== undefined && assessment.adaptive_support !== adaptive) return false;
    if (maxDuration && assessment.assessment_length > maxDuration) return false;
    if (testTypes?.length && !testTypes.some(type => assessment.test_type.includes(type))) return false;
    return true;
  });
};

// Perform vector search with filtering
export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query, ...filters } = params;
  
  try {
    // Load and filter assessments
    const allAssessments = await loadAssessmentData();
    const filteredAssessments = filterAssessments(allAssessments, filters);
    
    if (filteredAssessments.length === 0) {
      return [];
    }

    // Get embeddings
    const queryEmbedding = await getQueryEmbedding(query);
    const assessmentEmbeddings = await getAssessmentEmbeddings(filteredAssessments);

    // Calculate similarities and sort results
    const results = filteredAssessments
      .map(assessment => ({
        assessment,
        similarity: cosineSimilarity(queryEmbedding, assessmentEmbeddings[assessment.id])
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .map(result => result.assessment);

    return results;
  } catch (error) {
    console.error('Error in vector search:', error);
    throw error;
  }
};
