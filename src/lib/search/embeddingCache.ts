
import { EmbeddingCache } from '@/types/search';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { preprocessText } from './textProcessing';

// Cache for search query embeddings
const queryEmbeddingsCache: EmbeddingCache = {};

// Get embedding for a search query with caching
export const getQueryEmbedding = async (query: string): Promise<number[]> => {
  const normalizedQuery = query.trim().toLowerCase();
  
  // Return from cache if available
  if (queryEmbeddingsCache[normalizedQuery] && Array.isArray(queryEmbeddingsCache[normalizedQuery])) {
    console.log('Using cached query embedding');
    return queryEmbeddingsCache[normalizedQuery];
  }

  try {
    const processedQuery = preprocessText(query);
    console.log('Getting embedding for query:', processedQuery);
    
    const embeddingResult = await getEmbeddings([processedQuery]);
    
    // Validate embedding data
    if (!embeddingResult.data || !embeddingResult.data[0] || !Array.isArray(embeddingResult.data[0])) {
      console.error('Invalid embedding result:', embeddingResult);
      throw new Error('Failed to generate valid embedding');
    }
    
    // Cache the validated embedding
    queryEmbeddingsCache[normalizedQuery] = embeddingResult.data[0];
    
    // Log dimensions for debugging
    console.log(`Query embedding generated with ${embeddingResult.data[0].length} dimensions`);
    
    return embeddingResult.data[0];
  } catch (error) {
    console.error('Error getting query embedding:', error);
    throw error;
  }
};
