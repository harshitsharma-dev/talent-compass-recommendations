import { Assessment } from '@/lib/mockData';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { getEmbeddings } from '@/lib/embedding/embeddingModel';
import { cosineSimilarity } from './vectorOperations';

interface SearchParams {
  query: string;
  remote?: boolean;
  adaptive?: boolean;
  maxDuration?: number;
  testTypes?: string[];
}

// Cache for assessment embeddings
let assessmentEmbeddings: { [key: string]: number[] } = {};

// Enhanced text preprocessing with job role and skill mapping
const preprocessText = (text: string): string => {
  let processedText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')      // Remove extra spaces
    .trim();
  
  // Expanded synonyms and technology mappings
  const synonymMap: {[key: string]: string} = {
    // Programming languages and technologies
    'js': 'javascript',
    'javascript': 'javascript programming coding',
    'ts': 'typescript',
    'typescript': 'typescript programming coding',
    'py': 'python',
    'python': 'python programming coding',
    'sql': 'sql database query',
    'java': 'java programming coding',
    
    // Job roles and levels
    'dev': 'developer',
    'developer': 'developer programming coding',
    'sr': 'senior',
    'jr': 'junior',
    'mid-level': 'midlevel',
    'mid level': 'midlevel',
    'midlevel': 'intermediate experienced',
    'analyst': 'analytics data analysis',
    
    // Soft skills and test types
    'collab': 'collaboration',
    'collaborative': 'collaboration',
    'cognitive': 'cognitive assessment',
    'personality': 'personality test',
    'soft skills': 'behavioral assessment communication teamwork',
  };
  
  Object.entries(synonymMap).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  return processedText;
};

// Improved keyword-based search without embeddings
const performKeywordSearch = (assessments: Assessment[], query: string): Assessment[] => {
  const normalizedQuery = query.toLowerCase();
  const keywords = normalizedQuery.split(/\s+/).filter(k => k.length > 2);
  
  // Extract tech skills from query
  const techSkills = extractTechSkillsFromQuery(normalizedQuery);
  
  return assessments.map(assessment => {
    const searchableText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')} ${assessment.job_levels.join(' ')}`.toLowerCase();
    
    // Calculate a more sophisticated relevance score based on keyword matches
    let score = 0;
    
    // Match keywords
    keywords.forEach(keyword => {
      if (searchableText.includes(keyword)) {
        score += 1;
        // Boost score for keyword in title
        if (assessment.title.toLowerCase().includes(keyword)) {
          score += 2;
        }
        // Boost score for job level matches
        if (assessment.job_levels.some(level => level.toLowerCase().includes(keyword))) {
          score += 1.5;
        }
        // Boost score for test type matches
        if (assessment.test_type.some(type => type.toLowerCase().includes(keyword))) {
          score += 1.5;
        }
      }
    });
    
    // Match tech skills
    if (techSkills.length > 0) {
      const foundSkills = techSkills.filter(skill => 
        searchableText.includes(skill)
      );
      
      // Boost score for tech skill matches
      if (foundSkills.length > 0) {
        score += foundSkills.length * 3;
        // Extra boost if all skills are found
        if (foundSkills.length === techSkills.length) {
          score += 5;
        }
      }
    }
    
    // Add score for assessments that mention skills assessment or technical assessment
    if (normalizedQuery.includes("python") || normalizedQuery.includes("sql") || normalizedQuery.includes("javascript") || 
        normalizedQuery.includes("java")) {
      if (assessment.test_type.some(type => 
        type.toLowerCase().includes("technical") || 
        type.toLowerCase().includes("coding") || 
        type.toLowerCase().includes("skill")
      )) {
        score += 4;
      }
    }
    
    // Duration-based score adjustment
    if (query.includes('minutes') || query.includes('min')) {
      const durationMatches = query.match(/(\d+)\s*minutes|(\d+)\s*min/);
      if (durationMatches) {
        const requestedDuration = parseInt(durationMatches[1] || durationMatches[2]);
        // Favor assessments that are close to but under the requested duration
        if (assessment.assessment_length <= requestedDuration) {
          const durationCloseness = 1 - Math.abs(assessment.assessment_length - requestedDuration) / requestedDuration;
          score += durationCloseness * 2;
        }
      }
    }
    
    return { assessment, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.assessment);
};

// Get embedding for a search query
const getQueryEmbedding = async (query: string): Promise<number[]> => {
  try {
    console.log('Getting embedding for query:', query);
    const embeddingResult = await getEmbeddings([query]);
    // Access the first (and only) embedding in the data array
    return embeddingResult.data[0];
  } catch (error) {
    console.error('Error getting query embedding:', error);
    throw error;
  }
};

// Get embeddings for all assessments
const getAssessmentEmbeddings = async (assessments: Assessment[]): Promise<{ [key: string]: number[] }> => {
  const cached = Object.keys(assessmentEmbeddings).length;
  if (cached > 0) {
    console.log(`Using ${cached} cached assessment embeddings`);
    return assessmentEmbeddings;
  }

  try {
    console.log('Generating embeddings for assessments...');
    const texts = assessments.map(a => 
      `${a.title} ${a.description} Test types: ${a.test_type.join(', ')} Job levels: ${a.job_levels.join(', ')} Duration: ${a.assessment_length} minutes`
    );
    const embeddings = await getEmbeddings(texts);
    
    assessmentEmbeddings = assessments.reduce((acc, assessment, index) => {
      acc[assessment.id] = embeddings.data[index];
      return acc;
    }, {} as { [key: string]: number[] });

    console.log(`Generated embeddings for ${assessments.length} assessments`);
    return assessmentEmbeddings;
  } catch (error) {
    console.error('Error generating assessment embeddings:', error);
    throw error;
  }
};

// Extract tech skills from query
const extractTechSkillsFromQuery = (query: string): string[] => {
  const skills = [];
  const techSkillsMap: {[key: string]: string} = {
    'python': 'python',
    'sql': 'sql',
    'javascript': 'javascript',
    'js': 'javascript',
    'java ': 'java', // Space to avoid matching javascript
    'typescript': 'typescript',
    'ts': 'typescript',
    'c#': 'c#',
    'c++': 'c++',
    'react': 'react',
    'angular': 'angular',
    'vue': 'vue',
    'node': 'node',
    'php': 'php',
    'ruby': 'ruby',
    'go': 'go',
    'rust': 'rust',
    'swift': 'swift',
    'kotlin': 'kotlin',
  };
  
  Object.entries(techSkillsMap).forEach(([mention, skill]) => {
    if (query.includes(mention)) {
      skills.push(skill);
    }
  });
  
  return skills;
};

// Enhanced filter - recognizes duration mentions in natural language
const extractDurationFromQuery = (query: string): number | undefined => {
  const durationMatches = query.match(/(\d+)\s*minutes|(\d+)\s*min/i);
  if (durationMatches) {
    return parseInt(durationMatches[1] || durationMatches[2]);
  }
  return undefined;
};

// Enhanced filter - extracts test types from query
const extractTestTypesFromQuery = (query: string): string[] => {
  const testTypes = [];
  const lowerQuery = query.toLowerCase();
  
  // Map of common test type mentions to official test types
  const testTypeMap: {[key: string]: string} = {
    'coding': 'Coding Challenge',
    'technical': 'Technical Assessment',
    'cognitive': 'Cognitive Assessment',
    'personality': 'Personality Test',
    'behavioral': 'Behavioral Assessment',
    'skill': 'Skills Assessment',
    'problem solving': 'Problem Solving',
    'domain': 'Domain Knowledge',
    'python': 'Technical Assessment', // Map languages to technical assessments
    'sql': 'Technical Assessment',
    'javascript': 'Technical Assessment',
    'java': 'Technical Assessment',
  };
  
  Object.entries(testTypeMap).forEach(([mention, testType]) => {
    if (lowerQuery.includes(mention)) {
      if (!testTypes.includes(testType)) {
        testTypes.push(testType);
      }
    }
  });
  
  return testTypes;
};

// Filter assessments based on search parameters with smarter extraction
const filterAssessments = (
  assessments: Assessment[],
  { query, remote, adaptive, maxDuration, testTypes }: Partial<SearchParams>
): Assessment[] => {
  let filteredAssessments = [...assessments];
  
  // If maxDuration not explicitly provided but mentioned in query, extract it
  if (!maxDuration && query) {
    const extractedDuration = extractDurationFromQuery(query);
    if (extractedDuration) {
      maxDuration = extractedDuration;
    }
  }
  
  // If testTypes not explicitly provided but mentioned in query, extract them
  if ((!testTypes || testTypes.length === 0) && query) {
    const extractedTestTypes = extractTestTypesFromQuery(query);
    if (extractedTestTypes.length > 0) {
      testTypes = extractedTestTypes;
    }
  }
  
  // Apply filters
  return filteredAssessments.filter(assessment => {
    if (remote !== undefined && assessment.remote_support !== remote) return false;
    if (adaptive !== undefined && assessment.adaptive_support !== adaptive) return false;
    if (maxDuration && assessment.assessment_length > maxDuration) return false;
    if (testTypes?.length && !testTypes.some(type => assessment.test_type.includes(type))) return false;
    return true;
  });
};

// Perform vector search with filtering and better context understanding
export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query, ...filters } = params;
  
  try {
    const allAssessments = await loadAssessmentData();
    
    // Early return if no assessments found
    if (allAssessments.length === 0) {
      console.log('No assessments found in data source');
      return [];
    }
    
    // First try filtering without vector search for specific queries
    const techSkills = extractTechSkillsFromQuery(query.toLowerCase());
    const hasSkillsQuery = techSkills.length > 0;
    const hasDurationQuery = query.match(/(\d+)\s*minutes|(\d+)\s*min/i) != null;
    
    // For specific types of queries, prioritize keyword matching first
    if (hasSkillsQuery || hasDurationQuery) {
      console.log('Detected specialized query with tech skills or duration. Trying keyword search first.');
      
      let filteredAssessments = filterAssessments(allAssessments, params);
      
      // If we have too few results, relax the filtering
      if (filteredAssessments.length < 3) {
        console.log('Too few results with strict filtering, relaxing filters');
        
        // Try just with duration filter if specified
        if (hasDurationQuery) {
          const extractedDuration = extractDurationFromQuery(query);
          filteredAssessments = allAssessments.filter(a => 
            !extractedDuration || a.assessment_length <= extractedDuration
          );
        }
      }
      
      // If we still have results to work with, try keyword search
      if (filteredAssessments.length > 0) {
        const keywordResults = performKeywordSearch(filteredAssessments, query);
        
        // If we got reasonable results, return them
        if (keywordResults.length >= 1) {
          console.log(`Keyword search returned ${keywordResults.length} results`);
          return keywordResults;
        }
      }
    }
    
    // If we reach here, try the normal vector search pipeline
    let filteredAssessments = filterAssessments(allAssessments, params);
    
    if (filteredAssessments.length === 0) {
      console.log('No assessments after filtering, trying with just duration filter');
      
      // Try again with just duration filter if specified
      const extractedDuration = extractDurationFromQuery(query);
      if (extractedDuration) {
        filteredAssessments = allAssessments.filter(a => a.assessment_length <= extractedDuration);
      } else {
        // If no duration specified, use all assessments
        filteredAssessments = allAssessments;
      }
    }

    if (query.trim()) {
      try {
        // Preprocess query with enhanced context understanding
        const processedQuery = preprocessText(query);
        console.log('Processed query:', processedQuery);
        
        // Get embeddings
        const queryEmbedding = await getQueryEmbedding(processedQuery);
        const assessmentEmbeddings = await getAssessmentEmbeddings(filteredAssessments);

        // Calculate similarities with dynamic threshold based on query complexity
        const queryComplexity = processedQuery.split(' ').length;
        // More complex queries can have lower thresholds since exact matches are less likely
        const similarityThreshold = Math.max(0.4, 0.7 - queryComplexity * 0.02);
        console.log(`Using similarity threshold: ${similarityThreshold} for query complexity: ${queryComplexity}`);
        
        let results = filteredAssessments
          .map(assessment => ({
            assessment,
            similarity: cosineSimilarity(queryEmbedding, assessmentEmbeddings[assessment.id])
          }))
          .filter(result => result.similarity >= similarityThreshold)
          .sort((a, b) => b.similarity - a.similarity)
          .map(result => result.assessment);
          
        // If we have too few results, try keyword search
        if (results.length < 3) {
          console.log('Too few vector search results, trying keyword search');
          const keywordResults = performKeywordSearch(filteredAssessments, query);
          
          // If keyword search gives better results, use those
          if (keywordResults.length > results.length) {
            console.log(`Using keyword search results: ${keywordResults.length} vs ${results.length}`);
            results = keywordResults;
          }
        }
        
        // If still no results, ensure we return something
        if (results.length === 0) {
          console.log('No results from vector search, falling back to skills-based selection');
          
          // Find assessments based on skills mentioned
          const techSkills = extractTechSkillsFromQuery(query.toLowerCase());
          
          // If tech skills mentioned, find technical assessments
          if (techSkills.length > 0) {
            results = allAssessments.filter(assessment => 
              assessment.test_type.some(type => 
                type.includes('Technical') || 
                type.includes('Coding') || 
                type.includes('Skills')
              ) && 
              (!hasDurationQuery || assessment.assessment_length <= extractDurationFromQuery(query) || 60)
            ).slice(0, 5); // Limit to 5 results
          } else {
            // Otherwise just return some assessments
            results = allAssessments
              .filter(a => !hasDurationQuery || a.assessment_length <= extractDurationFromQuery(query) || 60)
              .slice(0, 5);
          }
        }
        
        console.log(`Final search returned ${results.length} results`);
        return results;
      } catch (error) {
        console.warn('Vector search failed, falling back to keyword search:', error);
        return performKeywordSearch(filteredAssessments, query);
      }
    }
    
    return filteredAssessments;
  } catch (error) {
    console.error('Error in search:', error);
    throw error;
  }
};
