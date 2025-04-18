
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { EmbeddingCache } from '@/types/search';

// Initialize embeddings from CSV data
export const initializeEmbeddings = async (): Promise<EmbeddingCache> => {
  console.log('Loading embeddings from CSV data...');
  
  try {
    // Load all assessments
    const assessments = await loadAssessmentData();
    console.log(`Processing embeddings for ${assessments.length} assessments...`);
    
    // Extract embeddings from assessment objects
    const embeddings: EmbeddingCache = {};
    let extractedCount = 0;
    
    // Extract embeddings from the CSV data
    for (const assessment of assessments) {
      if (assessment.embedding && Array.isArray(assessment.embedding) && assessment.embedding.length > 0) {
        embeddings[assessment.id] = assessment.embedding;
        extractedCount++;
      }
    }
    
    console.log(`Extracted ${extractedCount} embeddings from CSV data`);
    return embeddings;
    
  } catch (error) {
    console.error('Error initializing embeddings:', error);
    throw error;
  }
};

