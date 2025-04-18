import { Assessment } from '@/lib/mockData';
import { EmbeddingCache } from '@/types/search';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { preprocessText } from './textProcessing';
import { initializeEmbeddings } from './embeddingPersistence';

// Internal cache for runtime
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
  // If cache is empty, initialize from persistent storage
  if (Object.keys(assessmentEmbeddingsCache).length === 0) {
    assessmentEmbeddingsCache = await initializeEmbeddings();
  }
  
  return assessmentEmbeddingsCache;
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
