
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

    // Validate the response format
    if (!data) {
      console.error('Empty response from embedding API:', data);
      throw new Error('Empty embedding response from API');
    }
    
    // Handle the case where data is an array of arrays (expected format)
    if (Array.isArray(data) && data.every(item => Array.isArray(item))) {
      console.log(`Successfully generated ${data.length} embeddings with dimensions: ${data[0]?.length || 0}`);
      return { data };
    }
    
    // Handle the case where data is wrapped in a data property
    if (data.data && Array.isArray(data.data)) {
      console.log(`Successfully generated ${data.data.length} embeddings with dimensions: ${data.data[0]?.length || 0}`);
      return { data: data.data };
    }

    console.error('Unexpected embedding response format:', data);
    throw new Error('Invalid embedding format returned from API');
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
};
