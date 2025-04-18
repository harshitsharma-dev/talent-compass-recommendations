
export const extractDurationFromQuery = (query: string): number | undefined => {
  const durationMatches = query.match(/(\d+)\s*(minutes|mins|min|hour|hr|hours|hrs)/i);
  if (durationMatches) {
    const value = parseInt(durationMatches[1]);
    const unit = durationMatches[2].toLowerCase();
    return unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
  }
  
  const maxDurationMatches = query.match(/max(imum)?\s+(\d+)\s*(minutes|mins|min)/i);
  if (maxDurationMatches) return parseInt(maxDurationMatches[2]);
  
  const underDurationMatches = query.match(/under\s+(\d+)\s*(minutes|mins|min)/i);
  if (underDurationMatches) return parseInt(underDurationMatches[1]);
  
  return undefined;
};

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
  };
  
  Object.entries(techSkillsMap).forEach(([mention, skill]) => {
    if (query.toLowerCase().includes(mention.toLowerCase())) {
      skills.push(skill);
    }
  });
  
  return skills;
};

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
    'domain': 'Domain Knowledge'
  };
  
  Object.entries(testTypeMap).forEach(([mention, testType]) => {
    const regex = new RegExp(`\\b${mention}\\b`, 'i');
    if (regex.test(lowerQuery) && !testTypes.includes(testType)) {
      testTypes.push(testType);
    }
  });
  
  return testTypes;
};
