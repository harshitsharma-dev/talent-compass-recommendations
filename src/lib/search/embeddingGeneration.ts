
import { supabase } from "@/integrations/supabase/client";

export const generateAssessmentEmbeddings = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-assessment-embeddings');
    
    if (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
    
    console.log('Embeddings generation response:', data);
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
};
