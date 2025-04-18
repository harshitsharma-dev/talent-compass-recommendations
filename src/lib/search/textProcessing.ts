// Comprehensive text preprocessing for semantic search
export const preprocessText = (text: string): string => {
  if (!text) return '';
  
  // First, handle commas and other punctuation carefully
  let processedText = text
    .toLowerCase()
    // Replace commas with spaces but keep meaningful punctuation
    .replace(/,/g, ' ')
    // Remove other special characters but keep meaningful ones
    .replace(/[^\w\s-_.]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
  
  // Handle common abbreviations and terms
  const synonymMap: {[key: string]: string} = {
    // Programming languages and technologies
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
    
    // Job roles and test types
    'dev': 'developer software engineer programmer coder',
    'developer': 'developer software engineer programmer coder',
    'cognitive': 'cognitive assessment logical thinking problem-solving intelligence',
    'personality': 'personality test behavior characteristics traits temperament',
    'soft skills': 'behavioral assessment communication teamwork interpersonal',
    'analytical': 'analytical data-driven logical methodical',
    
    // Additional terms for better matching
    'tech': 'technology technical programming coding computer software',
    'frontend': 'front-end ui user interface web browser client-side',
    'backend': 'back-end api server database server-side',
    'fullstack': 'full-stack frontend backend complete development',
    'qa': 'quality assurance testing test verification',
    'testing': 'test assessment evaluation examination challenge',
    'assessment': 'test evaluation examination challenge measurement',
    'quick': 'short fast rapid brief speedy',
    'short': 'brief quick concise small minimal',
    'long': 'extensive detailed comprehensive thorough',
    'beginner': 'entry level junior novice starter learning',
    'expert': 'senior advanced experienced professional master',
  };
  
  // Replace all instances of synonyms with expanded forms
  Object.entries(synonymMap).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr.replace(/\+/g, '\\+')}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  return processedText;
};
