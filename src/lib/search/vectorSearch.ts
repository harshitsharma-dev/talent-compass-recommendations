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
  requiredSkills?: string[];
}

// Cache for assessment embeddings
let assessmentEmbeddings: { [key: string]: number[] } = {};

// Enhanced text preprocessing for better semantic matching
const preprocessText = (text: string): string => {
  // Normalize text: lowercase, remove extra spaces, replace punctuation with spaces
  let processedText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Comprehensive synonym mapping for better semantic understanding
  const synonymMap: {[key: string]: string} = {
    // Programming languages and technologies with expanded terminology
    'js': 'javascript',
    'javascript': 'javascript programming coding web development frontend',
    'ts': 'typescript',
    'typescript': 'typescript programming coding microsoft',
    'py': 'python',
    'python': 'python programming coding data science machine learning',
    'sql': 'sql database query data analysis relational database',
    'java': 'java programming coding backend enterprise',
    'react': 'react javascript frontend web development user interface',
    'angular': 'angular typescript frontend web development google',
    'vue': 'vue javascript frontend web development',
    'node': 'node.js javascript backend server',
    'nodejs': 'node.js javascript backend server',
    'c#': 'c# .net microsoft programming coding',
    'c++': 'c plus plus programming coding systems performance',
    'php': 'php web development backend',
    'ruby': 'ruby programming coding web development',
    'go': 'go golang programming coding performance',
    
    // Job roles and levels with expanded context
    'dev': 'developer software engineer programmer coder',
    'developer': 'developer software engineer programmer coder',
    'sr': 'senior experienced lead',
    'jr': 'junior entry-level beginner',
    'mid-level': 'midlevel intermediate experienced',
    'mid level': 'midlevel intermediate experienced',
    'midlevel': 'intermediate experienced',
    'lead': 'lead senior manager supervisor',
    'analyst': 'analytics data analysis business intelligence',
    'manager': 'manager leader supervisor director',
    
    // Soft skills and test types with expanded terminology
    'collab': 'collaboration teamwork cooperation',
    'collaborative': 'collaboration teamwork cooperation',
    'cognitive': 'cognitive assessment logical thinking problem-solving intelligence',
    'personality': 'personality test behavior characteristics traits temperament',
    'soft skills': 'behavioral assessment communication teamwork interpersonal emotional intelligence',
    'leadership': 'leadership management directing guiding inspiring',
    'communication': 'communication verbal written presentation interpersonal',
    'problem-solving': 'problem solving critical thinking analytical reasoning',
    'analytical': 'analytical data-driven logical methodical'
  };
  
  // Replace all instances of synonyms with expanded forms
  Object.entries(synonymMap).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr.replace(/\+/g, '\\+')}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  return processedText;
};

// Extract tech skills from query with comprehensive mapping
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
    'c++': 'c++', // Fix: Properly escaped C++
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
    'r': 'r',
    'scala': 'scala',
    'aws': 'aws',
    'azure': 'azure',
    'gcp': 'gcp',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'data science': 'data science',
    'machine learning': 'machine learning',
    'deep learning': 'deep learning',
    'nlp': 'natural language processing',
    'data analysis': 'data analysis',
    'big data': 'big data',
    'devops': 'devops',
    'frontend': 'frontend',
    'backend': 'backend',
    'fullstack': 'fullstack',
  };
  
  // Use regex to find all occurrences, not just first match
  Object.entries(techSkillsMap).forEach(([mention, skill]) => {
    // Fix: Use a safer regex approach for special characters
    try {
      const regex = new RegExp(`\\b${mention}\\b`, 'i');
      if (regex.test(query)) {
        skills.push(skill);
      }
    } catch (error) {
      console.warn(`Invalid regex pattern for skill: ${mention}`, error);
      // Try a simple string check as fallback
      if (query.toLowerCase().includes(mention.toLowerCase())) {
        skills.push(skill);
      }
    }
  });
  
  return skills;
};

// Enhanced regex-based duration extraction
const extractDurationFromQuery = (query: string): number | undefined => {
  // More comprehensive regex for duration extraction
  const durationMatches = query.match(/(\d+)\s*(minutes|mins|min|hour|hr|hours|hrs)/i);
  if (durationMatches) {
    const value = parseInt(durationMatches[1]);
    const unit = durationMatches[2].toLowerCase();
    
    // Convert hours to minutes if needed
    if (unit.includes('hour') || unit.includes('hr')) {
      return value * 60;
    }
    return value;
  }
  
  // Look for "maximum X minutes" or similar patterns
  const maxDurationMatches = query.match(/max(imum)?\s+(\d+)\s*(minutes|mins|min)/i);
  if (maxDurationMatches) {
    return parseInt(maxDurationMatches[2]);
  }
  
  // Look for "under X minutes" or similar patterns
  const underDurationMatches = query.match(/under\s+(\d+)\s*(minutes|mins|min)/i);
  if (underDurationMatches) {
    return parseInt(underDurationMatches[1]);
  }
  
  // Look for "X minutes or less" pattern
  const orLessDurationMatches = query.match(/(\d+)\s*(minutes|mins|min)\s+or\s+less/i);
  if (orLessDurationMatches) {
    return parseInt(orLessDurationMatches[1]);
  }
  
  return undefined;
};

// Enhanced test type extraction with comprehensive mapping
const extractTestTypesFromQuery = (query: string): string[] => {
  const testTypes = [];
  const lowerQuery = query.toLowerCase();
  
  // Comprehensive mapping of mentions to official test types
  const testTypeMap: {[key: string]: string} = {
    'coding': 'Coding Challenge',
    'code': 'Coding Challenge',
    'technical': 'Technical Assessment',
    'technical assessment': 'Technical Assessment',
    'tech assessment': 'Technical Assessment',
    'cognitive': 'Cognitive Assessment',
    'cognitive ability': 'Cognitive Assessment',
    'aptitude': 'Cognitive Assessment',
    'reasoning': 'Cognitive Assessment',
    'personality': 'Personality Test',
    'behavioral': 'Behavioral Assessment',
    'behaviour': 'Behavioral Assessment',
    'behavior': 'Behavioral Assessment',
    'soft skill': 'Behavioral Assessment',
    'skill': 'Skills Assessment',
    'skills': 'Skills Assessment',
    'problem solving': 'Problem Solving',
    'problem-solving': 'Problem Solving',
    'domain': 'Domain Knowledge',
    'knowledge': 'Domain Knowledge',
    'python': 'Technical Assessment',
    'sql': 'Technical Assessment',
    'javascript': 'Technical Assessment',
    'java': 'Technical Assessment',
    'programming': 'Coding Challenge',
    'development': 'Technical Assessment',
  };
  
  // Use more accurate regex pattern matching
  Object.entries(testTypeMap).forEach(([mention, testType]) => {
    const regex = new RegExp(`\\b${mention}\\b`, 'i');
    if (regex.test(lowerQuery) && !testTypes.includes(testType)) {
      testTypes.push(testType);
    }
  });
  
  return testTypes;
};

// Strictly filter assessments based on search parameters
const filterAssessments = (
  assessments: Assessment[],
  { query, remote, adaptive, maxDuration, testTypes, requiredSkills }: Partial<SearchParams>
): Assessment[] => {
  console.log('Filtering assessments with parameters:', { remote, adaptive, maxDuration, testTypes, requiredSkills });
  
  // Start with all assessments
  let filteredAssessments = [...assessments];
  
  // If maxDuration not explicitly provided but mentioned in query, extract it
  if (!maxDuration && query) {
    const extractedDuration = extractDurationFromQuery(query);
    if (extractedDuration) {
      console.log(`Extracted duration from query: ${extractedDuration} minutes`);
      maxDuration = extractedDuration;
    }
  }
  
  // If testTypes not explicitly provided but mentioned in query, extract them
  if ((!testTypes || testTypes.length === 0) && query) {
    const extractedTestTypes = extractTestTypesFromQuery(query);
    if (extractedTestTypes.length > 0) {
      console.log(`Extracted test types from query:`, extractedTestTypes);
      testTypes = extractedTestTypes;
    }
  }
  
  // If requiredSkills not explicitly provided but mentioned in query, extract them
  if ((!requiredSkills || requiredSkills.length === 0) && query) {
    // Use a try-catch to handle potential regex errors
    try {
      const extractedSkills = extractTechSkillsFromQuery(query.toLowerCase());
      if (extractedSkills.length > 0) {
        console.log(`Extracted skills from query:`, extractedSkills);
        requiredSkills = extractedSkills;
      }
    } catch (error) {
      console.error("Error extracting skills:", error);
    }
  }
  
  // Apply hard constraints but with some flexibility
  console.log(`Applying filters to ${assessments.length} assessments`);
  
  // Make filter more lenient - check for at least partial matches in descriptions
  const strictlyFiltered = filteredAssessments.filter(assessment => {
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    // Filter by remote support if required
    if (remote === true && !assessment.remote_support) {
      return false;
    }
    
    // Filter by adaptive support if required
    if (adaptive === true && !assessment.adaptive_support) {
      return false;
    }
    
    // Filter by maximum duration - add a 10% buffer for flexibility
    if (maxDuration && assessment.assessment_length > (maxDuration * 1.1)) {
      return false;
    }
    
    // Filter by test types - be more flexible
    if (testTypes?.length && !testTypes.some(type => 
      assessment.test_type.some(t => t.toLowerCase().includes(type.toLowerCase()))
    )) {
      return false;
    }
    
    // Filter by required skills - be more lenient using partial matches
    if (requiredSkills?.length) {
      // Consider assessment valid if at least one skill matches
      const hasAnyRequiredSkill = requiredSkills.some(skill => 
        assessmentText.includes(skill.toLowerCase())
      );
      
      if (!hasAnyRequiredSkill) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log(`Strict filtering reduced ${assessments.length} assessments to ${strictlyFiltered.length}`);
  
  // IMPORTANT: If no strict matches, use fallback to at least some results
  if (strictlyFiltered.length === 0) {
    console.log("No strict matches, using fallback logic");
    
    // For technical assessments related to programming languages, return technical assessments
    if (query?.toLowerCase().match(/python|javascript|java|sql|coding/i)) {
      const technicalAssessments = assessments.filter(a => 
        a.test_type.some(t => 
          t.toLowerCase().includes('technical') || 
          t.toLowerCase().includes('coding') || 
          t.toLowerCase().includes('programming')
        )
      ).slice(0, 10);
      
      if (technicalAssessments.length > 0) {
        console.log(`Found ${technicalAssessments.length} technical assessments as fallback`);
        return technicalAssessments;
      }
    }
    
    // Final fallback: return assessments that match any of the mentioned skills
    if (requiredSkills?.length) {
      const skillBasedAssessments = assessments.filter(assessment => {
        const assessmentText = `${assessment.title} ${assessment.description}`.toLowerCase();
        return requiredSkills.some(skill => assessmentText.includes(skill.toLowerCase()));
      }).slice(0, 10);
      
      if (skillBasedAssessments.length > 0) {
        console.log(`Found ${skillBasedAssessments.length} skill-based assessments as fallback`);
        return skillBasedAssessments;
      }
    }
    
    // Absolute last resort: return any assessment with the word "assessment" in it
    const anyAssessments = assessments.filter(a => 
      a.title.toLowerCase().includes('assessment')
    ).slice(0, 10);
    
    if (anyAssessments.length > 0) {
      console.log(`Returning ${anyAssessments.length} generic assessments as last resort`);
      return anyAssessments;
    }
    
    // If all else fails, just return the first 10 assessments
    console.log("Returning first 10 assessments as last resort");
    return assessments.slice(0, 10);
  }
  
  return strictlyFiltered;
};

// Get embedding for a search query using the ada-002 model
const getQueryEmbedding = async (query: string): Promise<number[]> => {
  try {
    // Preprocess the query text for better semantic matching
    const processedQuery = preprocessText(query);
    console.log('Getting embedding for processed query:', processedQuery);
    
    const embeddingResult = await getEmbeddings([processedQuery]);
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
    // Create semantically rich text representation for each assessment
    const texts = assessments.map(a => {
      // Combine all relevant fields with appropriate weighting/emphasis
      return preprocessText(
        `${a.title} ${a.title} ${a.description} ${a.description} ` + 
        `Test types: ${a.test_type.join(', ')} ${a.test_type.join(', ')} ` + 
        `Job levels: ${a.job_levels.join(', ')} ` + 
        `Duration: ${a.assessment_length} minutes ` +
        `${a.remote_support ? 'Remote testing supported' : ''} ` +
        `${a.adaptive_support ? 'Adaptive testing supported' : ''}`
      );
    });
    
    // Get embeddings for all assessment texts
    const embeddings = await getEmbeddings(texts);
    
    // Map embeddings to assessment IDs
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

// Perform vector search with filtering and better context understanding
export const performVectorSearch = async (params: SearchParams): Promise<Assessment[]> => {
  const { query, ...filters } = params;
  console.log('Performing vector search with query:', query);
  
  try {
    const allAssessments = await loadAssessmentData();
    
    // Early return if no assessments found
    if (allAssessments.length === 0) {
      console.log('No assessments found in data source');
      return [];
    }
    
    // First apply hard constraints to filter assessments (STEP 4)
    const filteredAssessments = filterAssessments(allAssessments, params);
    console.log(`After filtering: ${filteredAssessments.length} assessments remain`);
    
    // If we don't have enough assessments after filtering, ensure we return something
    if (filteredAssessments.length === 0) {
      console.log('No results after filtering, applying fallback strategy');
      // This should never happen now due to our improved fallback in filterAssessments
      return filterAssessments(allAssessments, { query }); // Try with just the query
    }
    
    if (query.trim()) {
      try {
        // STEP 5: Get embeddings and compute similarity
        console.log('Computing query embeddings and similarity scores');
        const queryEmbedding = await getQueryEmbedding(query);
        const assessmentEmbeddings = await getAssessmentEmbeddings(filteredAssessments);

        // Calculate similarities with dynamic threshold
        // More complex queries can have lower thresholds
        const similarityThreshold = 0.2; // Set a very low threshold to ensure results
        console.log(`Using similarity threshold: ${similarityThreshold.toFixed(2)}`);
        
        // STEP 6: Rank by similarity and select top results
        const scoredResults = filteredAssessments
          .map(assessment => ({
            assessment,
            similarity: cosineSimilarity(queryEmbedding, assessmentEmbeddings[assessment.id])
          }))
          .sort((a, b) => b.similarity - a.similarity);
        
        console.log(`Computed similarity scores for ${scoredResults.length} assessments`);
        
        // Always return results, even if they don't meet the threshold
        const finalResults = scoredResults.map(result => result.assessment).slice(0, 10);
        
        console.log(`Returning ${finalResults.length} final results ranked by relevance`);
        return finalResults;
      } catch (error) {
        console.error('Error in similarity calculation:', error);
        
        // If embedding fails, return filtered assessments directly
        console.log('Falling back to filtered assessments without similarity ranking');
        return filteredAssessments.slice(0, 10);
      }
    }
    
    // For empty queries, return filtered assessments directly
    return filteredAssessments.slice(0, 10);
  } catch (error) {
    console.error('Error in vector search:', error);
    // Always return something, even if there's an error
    try {
      const allAssessments = await loadAssessmentData();
      return allAssessments.slice(0, 10);
    } catch (e) {
      console.error('Fatal error, could not load any assessments:', e);
      return [];
    }
  }
};
