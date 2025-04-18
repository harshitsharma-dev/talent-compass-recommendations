
import { supabase } from "@/integrations/supabase/client";

// Get embeddings using OpenAI's text-embedding-ada-002 model
export const getEmbeddings = async (texts: string[]): Promise<{ data: number[][] }> => {
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

    // Validate and ensure the response contains proper embeddings
    if (!data || !Array.isArray(data) || data.some(item => !Array.isArray(item))) {
      console.error('Invalid embedding response format:', data);
      throw new Error('Invalid embedding format returned from API');
    }

    console.log(`Successfully generated ${data.length} embeddings with dimensions: ${data[0]?.length || 0}`);
    return { data };
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
};
