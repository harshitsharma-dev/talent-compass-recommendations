
// Function to extract duration information from query
export const extractDurationFromQuery = (query: string): number | undefined => {
  // Handle minute specifications
  const durationMatches = query.match(/(\d+)\s*(minutes|mins|min|hour|hr|hours|hrs)/i);
  if (durationMatches) {
    const value = parseInt(durationMatches[1]);
    const unit = durationMatches[2].toLowerCase();
    return unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
  }
  
  // Handle "maximum X minutes" pattern
  const maxDurationMatches = query.match(/max(imum)?\s+(\d+)\s*(minutes|mins|min)/i);
  if (maxDurationMatches) return parseInt(maxDurationMatches[2]);
  
  // Handle "under X minutes" pattern
  const underDurationMatches = query.match(/under\s+(\d+)\s*(minutes|mins|min)/i);
  if (underDurationMatches) return parseInt(underDurationMatches[1]);
  
  // Handle "less than X minutes" pattern
  const lessThanMatches = query.match(/less\s+than\s+(\d+)\s*(minutes|mins|min)/i);
  if (lessThanMatches) return parseInt(lessThanMatches[1]);
  
  // Handle "short test" or "quick test" patterns
  if (/\b(short|quick|brief)\b.*(test|assessment)/i.test(query)) {
    return 30; // Assume short means 30 minutes or less
  }
  
  return undefined;
};

// Function to extract tech skills from query
export const extractTechSkillsFromQuery = (query: string): string[] => {
  const skills: string[] = [];
  const techSkillsMap: {[key: string]: string} = {
    'python': 'python',
    'sql': 'sql',
    'javascript': 'javascript',
    'java': 'java',
    'typescript': 'typescript',
    'react': 'react',
    'angular': 'angular',
    'vue': 'vue',
    'node': 'node',
    'data science': 'data science',
    'machine learning': 'machine learning',
    'programming': 'programming',
    'coding': 'coding',
    'frontend': 'frontend',
    'backend': 'backend',
    'fullstack': 'fullstack',
    'development': 'development',
    'developer': 'developer',
    'software': 'software',
    'web': 'web development',
    'ui': 'UI',
    'ux': 'UX',
    'api': 'API',
    'devops': 'DevOps',
    'cloud': 'cloud computing',
    'database': 'database',
  };
  
  const lowerQuery = query.toLowerCase();
  
  Object.entries(techSkillsMap).forEach(([mention, skill]) => {
    const regex = new RegExp(`\\b${mention}\\b`, 'i');
    if (regex.test(lowerQuery) && !skills.includes(skill)) {
      skills.push(skill);
    }
  });
  
  return skills;
};

// Function to extract test types from query
export const extractTestTypesFromQuery = (query: string): string[] => {
  const testTypes = [];
  const lowerQuery = query.toLowerCase();
  
  const testTypeMap: {[key: string]: string} = {
    'coding': 'Coding Challenge',
    'technical': 'Technical Assessment',
    'cognitive': 'Cognitive Assessment',
    'personality': 'Personality Test',
    'behavioral': 'Behavioral Assessment',
    'skill': 'Skills Assessment',
    'problem solving': 'Problem Solving',
    'domain': 'Domain Knowledge',
    'assessment': 'Technical Assessment',
    'programming': 'Coding Challenge',
    'analytics': 'Data Analysis',
    'data analysis': 'Data Analysis',
    'data science': 'Data Science',
    'soft skill': 'Behavioral Assessment',
    'communication': 'Behavioral Assessment',
    'leadership': 'Leadership Assessment',
    'reasoning': 'Cognitive Assessment',
    'logical': 'Cognitive Assessment'
  };
  
  Object.entries(testTypeMap).forEach(([mention, testType]) => {
    const regex = new RegExp(`\\b${mention}\\b`, 'i');
    if (regex.test(lowerQuery) && !testTypes.includes(testType)) {
      testTypes.push(testType);
    }
  });
  
  return testTypes;
};
