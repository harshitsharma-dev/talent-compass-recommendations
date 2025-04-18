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

// Enhanced text preprocessing
const preprocessText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')      // Remove extra spaces
    .trim();
};

// Fallback keyword-based search without embeddings
const performKeywordSearch = (assessments: Assessment[], query: string): Assessment[] => {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  
  return assessments.map(assessment => {
    const searchableText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    // Calculate a simple relevance score based on keyword matches
    let score = 0;
    keywords.forEach(keyword => {
      if (searchableText.includes(keyword)) {
        score += 1;
        // Boost score for keyword in title
        if (assessment.title.toLowerCase().includes(keyword)) {
          score += 2;
        }
      }
    });
    
    return { assessment, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.assessment);
};

// Get embedding for a search query
const getQueryEmbedding = async (query: string): Promise<number[]> => {
  try {
    console.log('Getting embedding for query:', query);
    const embedding = await getEmbeddings([query]);
    return Array.from(embedding.data);
  } catch (error) {
    console.error('Error getting query embedding:', error);
    throw error;
  }
};

// Get embeddings for all assessments
const getAssessmentEmbeddings = async (assessments: Assessment[]): Promise<{ [key: string]: number[] }> => {
  const cached = Object.keys(assessmentEmbeddings).length;
  if (cached > 0) {
    console.log(`Using ${cached} cached assessment embeddings`);
    return assessmentEmbeddings;
  }

  try {
    console.log('Generating embeddings for assessments...');
    const texts = assessments.map(a => `${a.title} ${a.description}`);
    const embeddings = await getEmbeddings(texts);
    
    assessmentEmbeddings = assessments.reduce((acc, assessment, index) => {
      acc[assessment.id] = Array.from(embeddings.data[index]);
      return acc;
    }, {} as { [key: string]: number[] });

    console.log(`Generated embeddings for ${assessments.length} assessments`);
    return assessmentEmbeddings;
  } catch (error) {
    console.error('Error generating assessment embeddings:', error);
    throw error;
  }
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
    const allAssessments = await loadAssessmentData();
    const filteredAssessments = filterAssessments(allAssessments, filters);
    
    if (filteredAssessments.length === 0) {
      return [];
    }

    if (query.trim()) {
      try {
        // Preprocess query
        const processedQuery = preprocessText(query);
        
        // Get embeddings
        const queryEmbedding = await getQueryEmbedding(processedQuery);
        const assessmentEmbeddings = await getAssessmentEmbeddings(filteredAssessments);

        // Calculate similarities with threshold
        const similarityThreshold = 0.6; // Adjust this threshold as needed
        const results = filteredAssessments
          .map(assessment => ({
            assessment,
            similarity: cosineSimilarity(queryEmbedding, assessmentEmbeddings[assessment.id])
          }))
          .filter(result => result.similarity >= similarityThreshold)
          .sort((a, b) => b.similarity - a.similarity)
          .map(result => result.assessment);

        return results.length > 0 ? results : performKeywordSearch(filteredAssessments, query);
      } catch (error) {
        console.warn('Vector search failed, falling back to keyword search:', error);
        return performKeywordSearch(filteredAssessments, query);
      }
    }
    
    return filteredAssessments;
  } catch (error) {
    console.error('Error in search:', error);
    throw error;
  }
};
