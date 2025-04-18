
import { Assessment } from '@/lib/mockData';
import { EmbeddingCache } from '@/types/search';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { preprocessText } from './textProcessing';

// Persistent cache for assessment embeddings
let assessmentEmbeddingsCache: EmbeddingCache = {};
let queryEmbeddingsCache: EmbeddingCache = {};

// Check if embeddings are already loaded
export const isEmbeddingCacheLoaded = (): boolean => {
  return Object.keys(assessmentEmbeddingsCache).length > 0;
};

// Clear the embedding cache (useful for testing or forcing refresh)
export const clearEmbeddingCache = (): void => {
  assessmentEmbeddingsCache = {};
  queryEmbeddingsCache = {};
  console.log('Embedding cache cleared');
};

// Get embedding for a search query with caching
export const getQueryEmbedding = async (query: string): Promise<number[]> => {
  // Normalize the query to ensure consistent cache hits
  const normalizedQuery = query.trim().toLowerCase();
  
  // Return from cache if available
  if (queryEmbeddingsCache[normalizedQuery]) {
    console.log('Using cached query embedding');
    return queryEmbeddingsCache[normalizedQuery];
  }

  try {
    const processedQuery = preprocessText(query);
    console.log('Getting embedding for processed query:', processedQuery);
    
    const embeddingResult = await getEmbeddings([processedQuery]);
    
    // Store in cache for future use
    queryEmbeddingsCache[normalizedQuery] = embeddingResult.data[0];
    
    return embeddingResult.data[0];
  } catch (error) {
    console.error('Error getting query embedding:', error);
    throw error;
  }
};

// Generate and cache embeddings for all assessments
export const generateAssessmentEmbeddings = async (assessments: Assessment[]): Promise<EmbeddingCache> => {
  // If cache is already populated, return it
  if (Object.keys(assessmentEmbeddingsCache).length >= assessments.length) {
    console.log('Using cached assessment embeddings');
    return assessmentEmbeddingsCache;
  }

  try {
    console.log(`Generating embeddings for ${assessments.length} assessments...`);
    
    // Prepare rich text for each assessment to improve semantic search
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
    
    // Generate embeddings in batches to avoid API limits
    const batchSize = 20;
    let allEmbeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(texts.length/batchSize)}`);
      
      const embeddingResult = await getEmbeddings(batch);
      allEmbeddings = [...allEmbeddings, ...embeddingResult.data];
    }
    
    // Store in cache
    assessments.forEach((assessment, index) => {
      if (allEmbeddings[index]) {
        assessmentEmbeddingsCache[assessment.id] = allEmbeddings[index];
      }
    });
    
    console.log(`Successfully generated embeddings for ${Object.keys(assessmentEmbeddingsCache).length} assessments`);
    return assessmentEmbeddingsCache;
  } catch (error) {
    console.error('Error generating assessment embeddings:', error);
    throw error;
  }
};

// Get cached embedding for a specific assessment
export const getAssessmentEmbedding = (assessmentId: string): number[] | null => {
  return assessmentEmbeddingsCache[assessmentId] || null;
};

// Preload embeddings for all assessments
export const preloadEmbeddings = async (assessments: Assessment[]): Promise<void> => {
  try {
    await generateAssessmentEmbeddings(assessments);
    console.log('Embeddings preloaded successfully');
  } catch (error) {
    console.error('Failed to preload embeddings:', error);
  }
};
