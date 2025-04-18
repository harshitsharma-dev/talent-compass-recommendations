import { Assessment } from './mockData';
import { pipeline, env } from '@huggingface/transformers';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
}

// Configure transformers.js to use CDN for models
env.allowLocalModels = false;
env.useBrowserCache = true;

// The embedding model to use
const MODEL_NAME = "mixedbread-ai/mxbai-embed-xsmall-v1";

// Store the parsed CSV data
let parsedAssessments: Assessment[] = [];
// Store the computed embeddings
let assessmentEmbeddings: { id: string; embedding: number[] }[] = [];
// Flag to track if embeddings have been computed
let embeddingsComputed = false;
// Reference to the embedding pipeline
let embeddingPipeline: any = null;

// Simple CSV parser function
const parseCSV = (text: string): any[] => {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj: any, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
};

// Function to load and parse the CSV file
export const loadAssessmentData = async (): Promise<Assessment[]> => {
  return new Promise((resolve, reject) => {
    // Check if we already loaded the data
    if (parsedAssessments.length > 0) {
      console.log(`Using cached data with ${parsedAssessments.length} assessments`);
      resolve(parsedAssessments);
      return;
    }

    console.log('Fetching CSV data...');
    // Fetch the CSV file
    fetch('/combined_catalog_with_links_enriched_final.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load CSV file: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        // Parse CSV data
        console.log('CSV data fetched, parsing...');
        const results = parseCSV(csvText);
        console.log(`Parsed ${results.length} rows from CSV`);
        
        // Transform CSV data to match our Assessment interface
        const assessmentData = results
          .filter(row => row.title && row.url)
          .map((row, index) => ({
            id: String(index),
            title: row.title || 'Untitled Assessment',
            url: row.url || '#',
            remote_support: row.remote_support === 'Yes' || row.remote_support === 'true',
            adaptive_support: row.adaptive_support === 'Yes' || row.adaptive_support === 'true',
            test_type: row.test_type ? row.test_type.split(',').map((t: string) => t.trim()) : ['Technical Assessment'],
            description: row.description || 'No description available',
            job_levels: row.job_levels ? row.job_levels.split(',').map((j: string) => j.trim()) : ['All Levels'],
            languages: row.languages ? row.languages.split(',').map((l: string) => l.trim()) : ['English'],
            assessment_length: parseInt(row.assessment_length) || 45,
            downloads: parseInt(row.downloads) || 0
          }));

        console.log(`Created ${assessmentData.length} assessment objects`);
        parsedAssessments = assessmentData;
        resolve(assessmentData);
      })
      .catch(error => {
        console.error('Error loading CSV file:', error);
        reject(error);
      });
  });
};

// Initialize the embedding model
const initializeEmbeddingModel = async () => {
  if (embeddingPipeline) return embeddingPipeline;
  
  try {
    console.log('Initializing embedding model...');
    embeddingPipeline = await pipeline(
      'feature-extraction',
      MODEL_NAME,
      { quantized: true }
    );
    console.log('Embedding model initialized');
    return embeddingPipeline;
  } catch (error) {
    console.error('Error initializing embedding model:', error);
    throw error;
  }
};

// Calculate embeddings for all assessments
const calculateAssessmentEmbeddings = async (assessments: Assessment[]) => {
  if (embeddingsComputed && assessmentEmbeddings.length > 0) {
    console.log('Using cached embeddings');
    return;
  }

  try {
    console.log('Calculating embeddings for assessments...');
    const embedder = await initializeEmbeddingModel();
    
    // Calculate embeddings in batches to avoid memory issues
    const batchSize = 10;
    assessmentEmbeddings = [];
    
    for (let i = 0; i < assessments.length; i += batchSize) {
      const batch = assessments.slice(i, i + batchSize);
      const texts = batch.map(a => `${a.title} ${a.description}`);
      
      console.log(`Computing embeddings for batch ${i / batchSize + 1}/${Math.ceil(assessments.length / batchSize)}`);
      const embeddings = await embedder(texts, { pooling: "mean", normalize: true });
      
      // Store embeddings with their corresponding assessment ids
      batch.forEach((assessment, index) => {
        assessmentEmbeddings.push({
          id: assessment.id,
          embedding: Array.from(embeddings.data[index])
        });
      });
    }
    
    embeddingsComputed = true;
    console.log(`Calculated embeddings for ${assessmentEmbeddings.length} assessments`);
  } catch (error) {
    console.error('Error calculating assessment embeddings:', error);
    throw error;
  }
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  try {
    console.log('Performing vector search with params:', params);
    
    // Load the assessment data if not already loaded
    const assessments = await loadAssessmentData();
    console.log(`Loaded ${assessments.length} assessments for search`);
    
    // Initialize the embedding model and calculate embeddings if not already done
    await initializeEmbeddingModel();
    await calculateAssessmentEmbeddings(assessments);
    
    // Generate embedding for the query
    const embedder = embeddingPipeline;
    console.log(`Generating embedding for query: "${params.query}"`);
    const queryEmbedding = await embedder(params.query, { pooling: "mean", normalize: true });
    const queryVector = Array.from(queryEmbedding.data[0]);
    
    // Calculate similarity between query and all assessments
    console.log('Calculating similarity scores...');
    const scoredAssessments = assessments.map(assessment => {
      // Find the corresponding embedding for this assessment
      const assessmentEmbed = assessmentEmbeddings.find(embed => embed.id === assessment.id);
      
      // Calculate similarity score using cosine similarity
      const similarityScore = assessmentEmbed 
        ? cosineSimilarity(queryVector, assessmentEmbed.embedding)
        : 0;
      
      // Add keyword matching as a secondary signal
      const normalizedQuery = params.query.toLowerCase();
      const titleMatch = assessment.title.toLowerCase().includes(normalizedQuery) ? 0.1 : 0;
      const descMatch = assessment.description.toLowerCase().includes(normalizedQuery) ? 0.05 : 0;
      
      // Combine vector similarity with keyword matching
      const score = similarityScore + titleMatch + descMatch;
      
      return { assessment, score };
    });
    
    // Sort by score and filter based on parameters
    let results = scoredAssessments
      .filter(item => {
        // Apply filters
        if (params.remote !== undefined && params.remote !== item.assessment.remote_support) {
          return false;
        }
        
        if (params.adaptive !== undefined && params.adaptive !== item.assessment.adaptive_support) {
          return false;
        }
        
        if (params.maxDuration !== undefined && item.assessment.assessment_length > params.maxDuration) {
          return false;
        }
        
        if (params.testTypes && params.testTypes.length > 0) {
          // Check if assessment has at least one of the requested test types
          const hasMatchingType = params.testTypes.some(type => 
            item.assessment.test_type.includes(type)
          );
          
          if (!hasMatchingType) {
            return false;
          }
        }
        
        // Only keep assessments with a reasonable similarity score
        return item.score > 0.2;
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.assessment);
    
    console.log(`Search returned ${results.length} results after filtering`);
    
    // Return top results (max 20)
    const finalResults = results.slice(0, 20);
    console.log(`Returning ${finalResults.length} results after limiting to 20`);
    
    // Return a default result if nothing found to help debug
    if (finalResults.length === 0 && params.query.trim()) {
      console.log('No results found, returning default example result for debugging');
      const dummyResult: Assessment = {
        id: 'example-1',
        title: 'Example Assessment (No matches found)',
        description: `No results matched your query: "${params.query}". This might be because the embedding model couldn't find semantic matches or the data doesn't contain relevant assessments.`,
        url: '#',
        remote_support: true,
        adaptive_support: false,
        test_type: ['Technical Assessment'],
        job_levels: ['All Levels'],
        languages: ['English'],
        assessment_length: 45,
        downloads: 0
      };
      return [dummyResult];
    }
    
    return finalResults;
  } catch (error) {
    console.error('Error during vector search:', error);
    // Return default debug assessment for error cases
    const errorResult: Assessment = {
      id: 'error-1',
      title: 'Search Error Occurred',
      description: 'An error occurred during the search. This might be due to issues loading the embedding model or calculating embeddings. Please check the console for more details.',
      url: '#',
      remote_support: true,
      adaptive_support: false,
      test_type: ['Technical Assessment'],
      job_levels: ['All Levels'],
      languages: ['English'],
      assessment_length: 45,
      downloads: 0
    };
    return [errorResult];
  }
};
