
import { supabase } from "@/integrations/supabase/client";

// Cache for embeddings to avoid redundant API calls
let embeddingCache: { [text: string]: number[] } = {};

// Get embeddings using OpenAI's text-embedding-ada-002 model
export const getEmbeddings = async (texts: string[]): Promise<{ data: number[][] }> => {
  // Check cache first for all texts
  const cachedResults = texts.map(text => embeddingCache[text]);
  if (cachedResults.every(result => result !== undefined)) {
    console.log('All embeddings found in cache');
    return { data: cachedResults };
  }

  try {
    console.log(`Generating embeddings for ${texts.length} texts`);
    
    // Call the Supabase Edge Function to generate embeddings
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: { 
        texts,
        model: 'text-embedding-ada-002' // Explicitly request the recommended model
      }
    });

    if (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }

    // Cache the embeddings for future use
    texts.forEach((text, index) => {
      embeddingCache[text] = data[index];
    });

    console.log(`Successfully generated ${data.length} embeddings`);
    return { data };
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
};
