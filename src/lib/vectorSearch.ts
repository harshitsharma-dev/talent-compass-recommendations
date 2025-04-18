
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
      resolve(parsedAssessments);
      return;
    }

    // Fetch the CSV file
    fetch('/combined_catalog_with_links_enriched_final.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load CSV file');
        }
        return response.text();
      })
      .then(csvText => {
        // Parse CSV data
        const results = parseCSV(csvText);
        
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
    // Load the CSV data if not already loaded
    const assessments = await loadAssessmentData();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This is a very simplified simulation of semantic search
    // In reality, we would use vector similarity
    const normalizedQuery = params.query.toLowerCase();
    
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
        
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.assessment);
    
    // Return top results (max 20)
    return results.slice(0, 20);
  } catch (error) {
    console.error('Error during vector search:', error);
    // Return empty array in case of error
    return [];
  }
};
