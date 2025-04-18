
import { Assessment } from './mockData';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
}

// Store the parsed CSV data
let parsedAssessments: Assessment[] = [];

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
export const loadAssessmentData = (): Promise<Assessment[]> => {
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

export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  try {
    console.log('Performing search with params:', params);
    
    // Load the CSV data if not already loaded
    const assessments = await loadAssessmentData();
    console.log(`Loaded ${assessments.length} assessments for search`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This is a very simplified simulation of semantic search
    // In reality, we would use vector similarity
    const normalizedQuery = params.query.toLowerCase();
    console.log(`Normalized query: "${normalizedQuery}"`);
    
    const scoredAssessments = assessments.map(assessment => {
      // Calculate a simple relevance score based on text matching
      // (In a real app, this would be cosine similarity between vectors)
      const titleMatch = assessment.title.toLowerCase().includes(normalizedQuery) ? 5 : 0;
      const descMatch = assessment.description.toLowerCase().includes(normalizedQuery) ? 3 : 0;
      const typeMatch = assessment.test_type.some(type => 
        normalizedQuery.includes(type.toLowerCase())) ? 2 : 0;
      
      // Basic keyword matching for job roles
      const roleMatches = [
        'developer', 'engineer', 'designer', 'manager', 'analyst', 'executive', 
        'java', 'frontend', 'devops', 'product', 'data', 'ui', 'ux', 'qa', 
        'sales', 'security', 'project'
      ].filter(role => 
        normalizedQuery.includes(role) && 
        (assessment.title.toLowerCase().includes(role) || 
          assessment.description.toLowerCase().includes(role))
      ).length * 2;
      
      // Calculate total score
      const score = titleMatch + descMatch + typeMatch + roleMatches;
      
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
        
        return item.score > 0; // Only return items with a positive score
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.assessment);
    
    console.log(`Search returned ${results.length} results`);
    
    // Return top results (max 20)
    const finalResults = results.slice(0, 20);
    console.log(`Returning ${finalResults.length} results after limiting to 20`);
    
    // Return a default result if nothing found to help debug
    if (finalResults.length === 0 && params.query.trim()) {
      console.log('No results found, returning default example result for debugging');
      const dummyResult: Assessment = {
        id: 'example-1',
        title: 'Example Assessment (Debug: No matches found)',
        description: `No results matched your query: "${params.query}". This is a debug result to verify the search function is working.`,
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
      description: 'An error occurred during the search. Please try again.',
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
