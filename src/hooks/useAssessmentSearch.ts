
import { useState, useEffect, useCallback } from 'react';
import { Assessment } from '@/lib/mockData';
import { performVectorSearch } from '@/lib/search/vectorSearch';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { toast } from 'sonner';

// Define clear interfaces for search constraints
interface SearchFilters {
  remote: boolean;
  adaptive: boolean;
  maxDuration: number;
  testTypes: string[];
  requiredSkills: string[];
}

interface SearchResult {
  assessment: Assessment;
  similarityScore: number;
  matchedSkills: string[];
}

export const useAssessmentSearch = (initialQuery: string) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNoResults, setShowNoResults] = useState<boolean>(false);
  const [filters, setFilters] = useState<SearchFilters>({
    remote: false,
    adaptive: false,
    maxDuration: 120,
    testTypes: [],
    requiredSkills: [],
  });

  // Preload CSV data when hook mounts
  useEffect(() => {
    console.log('Loading assessment data');
    loadAssessmentData()
      .then(data => {
        console.log(`Successfully loaded ${data.length} assessments`);
      })
      .catch(error => {
        console.error('Failed to preload assessment data:', error);
        toast.error('Failed to load assessment data');
      });
  }, []);

  // Enhanced parameter extraction with regex patterns
  const extractSearchParameters = (searchQuery: string): Partial<SearchFilters> => {
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
    
    // Extract required skills with comprehensive mapping
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
    
    // Use regex to extract skills more accurately
    const techSkillPattern = /\b(python|sql|javascript|js|java|react|angular|node|c#|c\+\+|data analysis|machine learning)\b/gi;
    let match;
    while ((match = techSkillPattern.exec(lowercaseQuery)) !== null) {
      const skill = match[1].toLowerCase();
      const mappedSkills = skillMap[skill];
      if (mappedSkills && !extractedSkills.some(s => mappedSkills.includes(s))) {
        extractedSkills.push(...mappedSkills.filter(s => !extractedSkills.includes(s)));
      }
    }
    
    if (extractedSkills.length > 0) {
      extractedParams.requiredSkills = extractedSkills;
      console.log('Extracted skills:', extractedSkills);
    }
    
    // Map to test types - more comprehensive mapping
    const testTypeMap: {[key: string]: string} = {
      'coding': 'Coding Challenge',
      'technical': 'Technical Assessment',
      'cognitive': 'Cognitive Assessment',
      'personality': 'Personality Test',
      'behavioral': 'Behavioral Assessment',
      'collaboration': 'Behavioral Assessment',
      'skill': 'Skills Assessment',
      'problem solving': 'Problem Solving',
      'domain': 'Domain Knowledge',
      'python': 'Technical Assessment',
      'javascript': 'Technical Assessment',
      'java': 'Technical Assessment',
      'sql': 'Technical Assessment',
      'data': 'Cognitive Assessment',
      'analytics': 'Cognitive Assessment',
    };
    
    const extractedTypes: string[] = [];
    Object.entries(testTypeMap).forEach(([keyword, testType]) => {
      if (lowercaseQuery.includes(keyword) && !extractedTypes.includes(testType)) {
        extractedTypes.push(testType);
      }
    });
    
    if (extractedTypes.length > 0) {
      extractedParams.testTypes = extractedTypes;
      console.log('Extracted test types:', extractedTypes);
    }
    
    // Extract job level to further refine search
    const jobLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'executive'];
    jobLevels.forEach(level => {
      if (lowercaseQuery.includes(level)) {
        // Use job level as a context enhancer for embedding
        console.log(`Job level detected: ${level}`);
      }
    });
    
    return extractedParams;
  };

  // Strict filtering function as per STEP 4
  const strictFilter = (assessments: Assessment[], filters: Partial<SearchFilters>): Assessment[] => {
    return assessments.filter(assessment => {
      // Filter by duration if specified
      if (filters.maxDuration && assessment.assessment_length > filters.maxDuration) {
        return false;
      }
      
      // Filter by remote support if required
      if (filters.remote === true && !assessment.remote_support) {
        return false;
      }
      
      // Filter by adaptive support if required
      if (filters.adaptive === true && !assessment.adaptive_support) {
        return false;
      }
      
      // Filter by test types if specified
      if (filters.testTypes && filters.testTypes.length > 0 && 
          !filters.testTypes.some(type => assessment.test_type.includes(type))) {
        return false;
      }
      
      // Filter by required skills if specified
      if (filters.requiredSkills && filters.requiredSkills.length > 0) {
        // Extract skills from assessment description
        const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
        const hasRequiredSkill = filters.requiredSkills.some(skill => 
          assessmentText.includes(skill.toLowerCase())
        );
        
        if (!hasRequiredSkill) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Complete search pipeline implementation
  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setShowNoResults(false);
    
    console.log(`Performing search with query: "${searchQuery}"`);
    
    try {
      // Step 1: Load assessment data
      let allAssessments = await loadAssessmentData();
      console.log(`Loaded ${allAssessments.length} assessments`);
      
      if (searchQuery.trim() === '') {
        // If empty query, return all assessments
        setResults(allAssessments);
        setLoading(false);
        return;
      }
      
      // Step 3: Extract parameters/constraints from query
      const extractedParams = extractSearchParameters(searchQuery);
      console.log('Extracted parameters:', extractedParams);
      
      // Merge extracted parameters with explicit filters, prioritizing explicit ones
      const searchFilters = {
        remote: filters.remote || extractedParams.remote || false,
        adaptive: filters.adaptive || extractedParams.adaptive || false,
        maxDuration: filters.maxDuration !== 120 ? filters.maxDuration : extractedParams.maxDuration || 120,
        testTypes: filters.testTypes.length > 0 ? filters.testTypes : extractedParams.testTypes || [],
        requiredSkills: extractedParams.requiredSkills || [],
      };
      
      console.log('Search filters after merging:', searchFilters);
      
      // Step 4: Apply hard constraints to filter assessments
      const filteredAssessments = strictFilter(allAssessments, searchFilters);
      console.log(`After strict filtering: ${filteredAssessments.length} assessments`);
      
      // If no results after filtering, try with relaxed constraints
      if (filteredAssessments.length === 0) {
        console.log('No results after strict filtering, trying with relaxed constraints');
        
        // Relax duration constraint by 20%
        if (searchFilters.maxDuration && searchFilters.maxDuration < 120) {
          const relaxedDuration = Math.min(Math.round(searchFilters.maxDuration * 1.2), 120);
          const relaxedFilters = {...searchFilters, maxDuration: relaxedDuration};
          console.log(`Relaxed duration to ${relaxedDuration} minutes`);
          
          const relaxedResults = strictFilter(allAssessments, relaxedFilters);
          if (relaxedResults.length > 0) {
            console.log(`Found ${relaxedResults.length} results with relaxed duration`);
            
            // Step 5 & 6: Vector search with similarity ranking on relaxed results
            try {
              const rankedResults = await performVectorSearch({
                query: searchQuery,
                ...relaxedFilters
              });
              
              if (rankedResults.length > 0) {
                console.log(`Vector search returned ${rankedResults.length} ranked results`);
                setResults(rankedResults);
                
                // Notify user of the relaxed constraint
                toast.info(`Showing assessments with duration up to ${relaxedDuration} minutes`);
                sessionStorage.setItem('assessment-results', JSON.stringify(rankedResults));
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('Vector search error with relaxed constraints:', error);
            }
          }
        }
        
        // If still no results, try keyword-based fallback for technical queries
        if (searchQuery.toLowerCase().match(/(python|javascript|js|java|sql)/)) {
          console.log('Using technical assessment fallback');
          
          const techAssessments = allAssessments.filter(assessment => 
            assessment.test_type.some(type => 
              type.includes('Technical') || type.includes('Coding') || type.includes('Skills')
            )
          ).slice(0, 10);
          
          if (techAssessments.length > 0) {
            console.log(`Found ${techAssessments.length} technical assessments as fallback`);
            setResults(techAssessments);
            toast.warning('Showing technical assessments that may match your requirements');
            sessionStorage.setItem('assessment-results', JSON.stringify(techAssessments));
            setLoading(false);
            return;
          }
        }
        
        // Absolute fallback: just return some assessments that might be relevant
        const fallbackResults = allAssessments.slice(0, 10);
        console.log(`Returning ${fallbackResults.length} assessments as absolute fallback`);
        setResults(fallbackResults);
        toast.warning('No exact matches found. Showing potentially relevant assessments.');
        sessionStorage.setItem('assessment-results', JSON.stringify(fallbackResults));
        setLoading(false);
        return;
      }
      
      // Steps 5 & 6: Use vector search for similarity ranking
      try {
        console.log('Performing vector search with similarity ranking');
        const rankedResults = await performVectorSearch({
          query: searchQuery,
          ...searchFilters
        });
        
        // Ensure we always have results
        if (rankedResults.length > 0) {
          console.log(`Vector search returned ${rankedResults.length} ranked results`);
          setResults(rankedResults);
          toast.success(`Found ${rankedResults.length} matching assessments`);
        } else {
          // Fallback to filtered results if vector search returns nothing
          console.log(`Vector search returned no results, using filtered assessments`);
          setResults(filteredAssessments);
          toast.info(`Found ${filteredAssessments.length} assessments matching your criteria`);
        }
        
        sessionStorage.setItem('assessment-results', JSON.stringify(rankedResults.length > 0 ? rankedResults : filteredAssessments));
      } catch (error) {
        console.error('Error in vector search:', error);
        
        // Fallback to filtered assessments if vector search fails
        console.log(`Vector search failed, using strict filtered assessments as fallback`);
        setResults(filteredAssessments);
        toast.warning('Advanced search unavailable, using basic search instead');
        sessionStorage.setItem('assessment-results', JSON.stringify(filteredAssessments));
      }
      
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Failed to load recommendations. Please try again.');
      setResults([]);
      setShowNoResults(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load initial data function for the ResultsPage
  const loadInitialData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setShowNoResults(false);
    
    try {
      // First check if we have results in session storage
      const storedResults = sessionStorage.getItem('assessment-results');
      let assessmentResults: Assessment[] = [];
      
      if (storedResults) {
        console.log('Loading results from session storage');
        try {
          assessmentResults = JSON.parse(storedResults);
        } catch (error) {
          console.error('Error parsing stored results:', error);
          assessmentResults = await loadAssessmentData();
        }
      } else {
        console.log('No stored results found, loading all assessments');
        // If no results in session storage, load all assessments
        assessmentResults = await loadAssessmentData();
      }
      
      // Store the results
      setResults(assessmentResults);
      
      if (assessmentResults.length === 0) {
        setShowNoResults(true);
      }
      
      console.log(`Loaded ${assessmentResults.length} assessments`);
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load assessment data');
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    query,
    setQuery,
    results,
    setResults,
    loading,
    setLoading,
    showNoResults,
    filters,
    updateFilters,
    performSearch,
    loadInitialData,
  };
};
