
import { Assessment } from '../mockData';
import { loadAssessmentData } from '../data/assessmentLoader';
import { getEmbeddings } from '../embedding/embeddingModel';
import { cosineSimilarity } from './vectorOperations';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
}

// Store the computed embeddings
let assessmentEmbeddings: { id: string; embedding: number[] }[] = [];
// Flag to track if embeddings have been computed
let embeddingsComputed = false;

// Calculate embeddings for all assessments
const calculateAssessmentEmbeddings = async (assessments: Assessment[]) => {
  if (embeddingsComputed && assessmentEmbeddings.length > 0) {
    console.log('Using cached embeddings');
    return;
  }

  try {
    console.log('Calculating embeddings for assessments...');
    
    // Calculate embeddings in batches to avoid memory issues
    const batchSize = 10;
    assessmentEmbeddings = [];
    
    for (let i = 0; i < assessments.length; i += batchSize) {
      const batch = assessments.slice(i, i + batchSize);
      const texts = batch.map(a => `${a.title} ${a.description}`);
      
      console.log(`Computing embeddings for batch ${i / batchSize + 1}/${Math.ceil(assessments.length / batchSize)}`);
      const embeddings = await getEmbeddings(texts);
      
      // Store embeddings with their corresponding assessment ids
      batch.forEach((assessment, index) => {
        assessmentEmbeddings.push({
          id: assessment.id,
          embedding: Array.from(embeddings.data[index] as Float32Array) as number[]
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

export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  try {
    console.log('Performing vector search with params:', params);
    
    // Load the assessment data if not already loaded
    const assessments = await loadAssessmentData();
    console.log(`Loaded ${assessments.length} assessments for search`);
    
    // Calculate embeddings if not already done
    await calculateAssessmentEmbeddings(assessments);
    
    // Generate embedding for the query
    console.log(`Generating embedding for query: "${params.query}"`);
    const queryEmbedding = await getEmbeddings([params.query]);
    const queryVector = Array.from(queryEmbedding.data[0] as Float32Array) as number[];
    
    // Calculate similarity between query and all assessments
    console.log('Calculating similarity scores...');
    const scoredAssessments = assessments.map(assessment => {
      const assessmentEmbed = assessmentEmbeddings.find(embed => embed.id === assessment.id);
      
      const similarityScore = assessmentEmbed 
        ? cosineSimilarity(queryVector, assessmentEmbed.embedding)
        : 0;
      
      const normalizedQuery = params.query.toLowerCase();
      const titleMatch = assessment.title.toLowerCase().includes(normalizedQuery) ? 0.1 : 0;
      const descMatch = assessment.description.toLowerCase().includes(normalizedQuery) ? 0.05 : 0;
      
      const score = similarityScore + titleMatch + descMatch;
      
      return { assessment, score };
    });
    
    let results = scoredAssessments
      .filter(item => {
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
          const hasMatchingType = params.testTypes.some(type => 
            item.assessment.test_type.includes(type)
          );
          
          if (!hasMatchingType) {
            return false;
          }
        }
        
        return item.score > 0.2;
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.assessment);
    
    console.log(`Search returned ${results.length} results after filtering`);
    
    const finalResults = results.slice(0, 20);
    console.log(`Returning ${finalResults.length} results after limiting to 20`);
    
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
