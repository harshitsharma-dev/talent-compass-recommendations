
import { Assessment, assessments } from './mockData';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
}

export const performVectorSearch = (params: SearchParams): Promise<Assessment[]> => {
  return new Promise((resolve) => {
    // In a real application, this would call the OpenAI embedding API
    // and perform a vector search against a database like Pinecone

    // Simulate processing delay
    setTimeout(() => {
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
      
      // Return top results (max 10)
      resolve(results.slice(0, 10));
    }, 1000); // Simulate network delay
  });
};
