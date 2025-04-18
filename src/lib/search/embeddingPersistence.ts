
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
    let invalidCount = 0;
    
    // Extract and validate embeddings from the CSV data
    for (const assessment of assessments) {
      if (assessment.embedding) {
        try {
          // Handle different possible embedding formats
          let embeddingArray: number[];
          
          if (typeof assessment.embedding === 'string') {
            // Handle string format (JSON string)
            // Make sure we're working with a string before calling replace
            const embeddingString = String(assessment.embedding);
            embeddingArray = JSON.parse(embeddingString.replace(/'/g, '"'));
          } else if (Array.isArray(assessment.embedding)) {
            // Already an array
            embeddingArray = assessment.embedding;
          } else {
            throw new Error('Unknown embedding format');
          }
          
          // Validate it's actually a numeric array
          if (Array.isArray(embeddingArray) && 
              embeddingArray.length > 0 && 
              typeof embeddingArray[0] === 'number') {
            embeddings[assessment.id] = embeddingArray;
            extractedCount++;
          } else {
            invalidCount++;
            console.warn(`Invalid embedding format for assessment ID: ${assessment.id}`);
          }
        } catch (err) {
          invalidCount++;
          console.warn(`Failed to parse embedding for assessment ID: ${assessment.id}`, err);
        }
      }
    }
    
    console.log(`Successfully extracted ${extractedCount} valid embeddings from CSV data`);
    if (invalidCount > 0) {
      console.warn(`Found ${invalidCount} invalid embeddings in the data`);
    }
    
    return embeddings;
    
  } catch (error) {
    console.error('Error initializing embeddings:', error);
    throw error;
  }
};
