
import { supabase } from "@/integrations/supabase/client";

// Cache for embeddings to avoid redundant API calls
let embeddingCache: { [text: string]: number[] } = {};

export const getEmbeddings = async (texts: string[]): Promise<{ data: number[][] }> => {
  // Check cache first
  const cachedResults = texts.map(text => embeddingCache[text]);
  if (cachedResults.every(result => result !== undefined)) {
    return { data: cachedResults };
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: { texts }
    });

    if (error) {
      throw error;
    }

    // Cache the embeddings
    texts.forEach((text, index) => {
      embeddingCache[text] = data[index];
    });

    return { data };
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
};
