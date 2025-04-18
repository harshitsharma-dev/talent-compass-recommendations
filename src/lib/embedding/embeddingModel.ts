
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use CDN for models
env.allowLocalModels = false;
env.useBrowserCache = true;

// The embedding model to use
const MODEL_NAME = "mixedbread-ai/mxbai-embed-xsmall-v1";

// Reference to the embedding pipeline
let embeddingPipeline: any = null;

// Initialize the embedding model
export const initializeEmbeddingModel = async () => {
  if (embeddingPipeline) return embeddingPipeline;
  
  try {
    console.log('Initializing embedding model...');
    embeddingPipeline = await pipeline(
      'feature-extraction',
      MODEL_NAME,
      { device: 'wasm' }  // Changed from 'cpu' to 'wasm'
    );
    console.log('Embedding model initialized');
    return embeddingPipeline;
  } catch (error) {
    console.error('Error initializing embedding model:', error);
    throw error;
  }
};

// Get embeddings for a batch of texts
export const getEmbeddings = async (texts: string[]) => {
  const embedder = await initializeEmbeddingModel();
  return embedder(texts, { pooling: "mean", normalize: true });
};
