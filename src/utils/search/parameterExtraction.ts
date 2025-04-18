
// Parameter extraction utilities for search
import { SearchFilters } from '@/types/search';

// Enhanced parameter extraction with regex patterns
export const extractSearchParameters = (searchQuery: string): Partial<SearchFilters> => {
  const extractedParams: Partial<SearchFilters> = {};
  const lowercaseQuery = searchQuery.toLowerCase();
  
  // Extract duration with regex
  const durationMatches = lowercaseQuery.match(/(\d+)\s*(minutes|mins|min)/i);
  if (durationMatches) {
    extractedParams.maxDuration = parseInt(durationMatches[1]);
    console.log(`Extracted duration: ${extractedParams.maxDuration} minutes`);
  }
  
  // Extract remote support requirement
  if (/remote|online|virtual|from home/i.test(lowercaseQuery)) {
    extractedParams.remote = true;
    console.log('Remote support required: true');
  }
  
  // Extract adaptive testing requirement
  if (/adaptive|irt|personalized|customized test/i.test(lowercaseQuery)) {
    extractedParams.adaptive = true;
    console.log('Adaptive support required: true');
  }
  
  // Extract required skills
  extractedParams.requiredSkills = extractSkillsFromQuery(searchQuery);
  if (extractedParams.requiredSkills?.length > 0) {
    console.log('Extracted skills:', extractedParams.requiredSkills);
  }
  
  // Extract test types
  extractedParams.testTypes = extractTestTypesFromQuery(searchQuery);
  if (extractedParams.testTypes?.length > 0) {
    console.log('Extracted test types:', extractedParams.testTypes);
  }
  
  return extractedParams;
};

const extractSkillsFromQuery = (query: string): string[] => {
  const skillMap: {[key: string]: string[]} = {
    'python': ['Python', 'Programming', 'Coding'],
    'sql': ['SQL', 'Database', 'Data Analysis'],
    'javascript': ['JavaScript', 'JS', 'Web Development', 'Frontend'],
    'java': ['Java', 'Programming', 'Backend'],
    'react': ['React', 'Frontend', 'JavaScript Framework'],
    'angular': ['Angular', 'Frontend', 'JavaScript Framework'],
    'node': ['Node.js', 'Backend', 'JavaScript'],
    'c#': ['C#', '.NET', 'Programming'],
    'c++': ['C++', 'Programming'],
    'data analysis': ['Data Analysis', 'Analytics', 'Statistics'],
    'machine learning': ['Machine Learning', 'AI', 'Data Science'],
    'problem solving': ['Problem Solving', 'Critical Thinking'],
    'leadership': ['Leadership', 'Management'],
    'communication': ['Communication', 'Soft Skills']
  };
  
  const extractedSkills: string[] = [];
  const techSkillPattern = /\b(python|sql|javascript|js|java|react|angular|node|c#|c\+\+|data analysis|machine learning)\b/gi;
  
  let match;
  while ((match = techSkillPattern.exec(query.toLowerCase())) !== null) {
    const skill = match[1].toLowerCase();
    const mappedSkills = skillMap[skill];
    if (mappedSkills) {
      extractedSkills.push(...mappedSkills.filter(s => !extractedSkills.includes(s)));
    }
  }
  
  return extractedSkills;
};

const extractTestTypesFromQuery = (query: string): string[] => {
  const testTypeMap: {[key: string]: string} = {
    'coding': 'Coding Challenge',
    'technical': 'Technical Assessment',
    'cognitive': 'Cognitive Assessment',
    'personality': 'Personality Test',
    'behavioral': 'Behavioral Assessment',
    'skill': 'Skills Assessment',
    'problem solving': 'Problem Solving',
    'domain': 'Domain Knowledge'
  };
  
  const extractedTypes: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  Object.entries(testTypeMap).forEach(([keyword, testType]) => {
    if (lowerQuery.includes(keyword) && !extractedTypes.includes(testType)) {
      extractedTypes.push(testType);
    }
  });
  
  return extractedTypes;
};
