
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { Assessment } from '@/lib/mockData';
import { EmbeddingCache } from '@/types/search';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { preprocessText } from './textProcessing';

const EMBEDDING_STORAGE_KEY = 'assessment-embeddings-cache-v1';

// Load embeddings from localStorage
const loadStoredEmbeddings = (): EmbeddingCache | null => {
  try {
    const stored = localStorage.getItem(EMBEDDING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading stored embeddings:', error);
    return null;
  }
};

// Save embeddings to localStorage
const saveEmbeddings = (embeddings: EmbeddingCache): void => {
  try {
    localStorage.setItem(EMBEDDING_STORAGE_KEY, JSON.stringify(embeddings));
    console.log('Embeddings saved to local storage');
  } catch (error) {
    console.error('Error saving embeddings:', error);
  }
};

// Initialize embeddings for all assessments
export const initializeEmbeddings = async (): Promise<EmbeddingCache> => {
  console.log('Checking for stored embeddings...');
  
  // Try to load existing embeddings
  const storedEmbeddings = loadStoredEmbeddings();
  if (storedEmbeddings) {
    console.log('Using stored embeddings from local storage');
    return storedEmbeddings;
  }
  
  console.log('No stored embeddings found, generating new ones...');
  
  try {
    // Load all assessments
    const assessments = await loadAssessmentData();
    console.log(`Generating embeddings for ${assessments.length} assessments...`);
    
    // Prepare rich text for each assessment
    const texts = assessments.map(a => 
      preprocessText(
        `${a.title} ${a.description} ` + 
        `Test types: ${a.test_type.join(', ')} ` + 
        `Job levels: ${a.job_levels.join(', ')} ` + 
        `Duration: ${a.assessment_length} minutes ` +
        `${a.remote_support ? 'Remote testing supported' : ''} ` +
        `${a.adaptive_support ? 'Adaptive testing supported' : ''}`
      )
    );
    
    // Generate embeddings in batches
    const batchSize = 20;
    const embeddings: EmbeddingCache = {};
    
    for (let i = 0; i < assessments.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(assessments.length/batchSize)}`);
      
      const embeddingResult = await getEmbeddings(batch);
      
      // Store embeddings with assessment IDs
      batch.forEach((_, index) => {
        if (embeddingResult.data[index]) {
          embeddings[assessments[i + index].id] = embeddingResult.data[index];
        }
      });
    }
    
    // Save to local storage
    saveEmbeddings(embeddings);
    console.log('Generated and stored embeddings for all assessments');
    
    return embeddings;
  } catch (error) {
    console.error('Error initializing embeddings:', error);
    throw error;
  }
};
