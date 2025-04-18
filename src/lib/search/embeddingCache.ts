
import { EmbeddingCache } from '@/types/search';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { preprocessText } from './textProcessing';

// Cache for search query embeddings
const queryEmbeddingsCache: EmbeddingCache = {};

// Get embedding for a search query with caching
export const getQueryEmbedding = async (query: string): Promise<number[]> => {
  const normalizedQuery = query.trim().toLowerCase();
  
  // Return from cache if available
  if (queryEmbeddingsCache[normalizedQuery]) {
    console.log('Using cached query embedding');
    return queryEmbeddingsCache[normalizedQuery];
  }

  try {
    const processedQuery = preprocessText(query);
    console.log('Getting embedding for query:', processedQuery);
    
    const embeddingResult = await getEmbeddings([processedQuery]);
    queryEmbeddingsCache[normalizedQuery] = embeddingResult.data[0];
    
    return embeddingResult.data[0];
  } catch (error) {
    console.error('Error getting query embedding:', error);
    throw error;
  }
};

