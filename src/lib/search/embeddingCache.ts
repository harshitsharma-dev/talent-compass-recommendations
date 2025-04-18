import { EmbeddingCache } from '@/types/search';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { preprocessText } from './textProcessing';

// Only keep query embeddings cache since assessment embeddings are now in the database
let queryEmbeddingsCache: EmbeddingCache = {};

// Clear the embedding cache (useful for testing or forcing refresh)
export const clearEmbeddingCache = (): void => {
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
