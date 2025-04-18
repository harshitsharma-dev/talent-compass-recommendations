
import { supabase } from "@/integrations/supabase/client";

// Remove generateAssessmentEmbeddings since we don't need it anymore
export const generateEmbeddings = async (texts: string[]): Promise<{ data: number[][] }> => {
  try {
    console.log(`Generating embeddings for ${texts.length} texts`);
    
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: { 
        texts,
        model: 'text-embedding-ada-002'
      }
    });

    if (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }

    console.log(`Successfully generated ${data.length} embeddings`);
    return { data };
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
};
