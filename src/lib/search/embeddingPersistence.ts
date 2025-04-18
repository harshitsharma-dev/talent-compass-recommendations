
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
    if (!stored) return null;
    
    const parsedEmbeddings = JSON.parse(stored);
    // Check if we actually have embeddings in the cache
    const embeddingCount = Object.keys(parsedEmbeddings).length;
    console.log(`Found ${embeddingCount} stored embeddings`);
    
    // Only return the embeddings if we actually found some
    return embeddingCount > 0 ? parsedEmbeddings : null;
  } catch (error) {
    console.error('Error loading stored embeddings:', error);
    return null;
  }
};

// Save embeddings to localStorage
const saveEmbeddings = (embeddings: EmbeddingCache): void => {
  try {
    const embeddingCount = Object.keys(embeddings).length;
    if (embeddingCount === 0) {
      console.warn('Attempted to save empty embeddings cache, skipping save');
      return;
    }
    
    localStorage.setItem(EMBEDDING_STORAGE_KEY, JSON.stringify(embeddings));
    console.log(`Saved ${embeddingCount} embeddings to local storage`);
  } catch (error) {
    console.error('Error saving embeddings:', error);
  }
};

// Initialize embeddings for all assessments
export const initializeEmbeddings = async (): Promise<EmbeddingCache> => {
  console.log('Checking for stored embeddings...');
  
  // Try to load existing embeddings
  const storedEmbeddings = loadStoredEmbeddings();
  if (storedEmbeddings && Object.keys(storedEmbeddings).length > 0) {
    console.log(`Using stored embeddings from local storage (${Object.keys(storedEmbeddings).length} found)`);
    return storedEmbeddings;
  }
  
  console.log('No valid stored embeddings found, generating new ones...');
  
  try {
    // Load all assessments
    const assessments = await loadAssessmentData();
    console.log(`Generating embeddings for ${assessments.length} assessments...`);
    
    // Extract embeddings from assessment objects if they exist
    const embeddings: EmbeddingCache = {};
    let extractedCount = 0;
    
    // First try to extract embeddings from the pre-computed CSV data
    for (const assessment of assessments) {
      if (assessment.embedding && Array.isArray(assessment.embedding) && assessment.embedding.length > 0) {
        embeddings[assessment.id] = assessment.embedding;
        extractedCount++;
      }
    }
    
    // If we found embeddings in the CSV data, use those
    if (extractedCount > 0) {
      console.log(`Extracted ${extractedCount} pre-computed embeddings from assessment data`);
      saveEmbeddings(embeddings);
      return embeddings;
    }
    
    console.log('No pre-computed embeddings found, generating via API...');
    
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
    console.log(`Generated and stored embeddings for all assessments (${Object.keys(embeddings).length})`);
    
    return embeddings;
  } catch (error) {
    console.error('Error initializing embeddings:', error);
    throw error;
  }
};

