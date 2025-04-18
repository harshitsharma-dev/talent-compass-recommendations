import { useState, useEffect, useCallback } from 'react';
import { Assessment } from '@/lib/mockData';
import { performVectorSearch } from '@/lib/search/vectorSearch';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { toast } from 'sonner';

interface SearchFilters {
  remote: boolean;
  adaptive: boolean;
  maxDuration: number;
  testTypes: string[];
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

  // Extract parameters from natural language query
  const extractSearchParameters = (searchQuery: string): Partial<SearchFilters> => {
    const extractedParams: Partial<SearchFilters> = {};
    
    // Extract duration
    const durationMatches = searchQuery.match(/(\d+)\s*minutes|(\d+)\s*min/i);
    if (durationMatches) {
      extractedParams.maxDuration = parseInt(durationMatches[1] || durationMatches[2]);
    }
    
    // Look for remote mentions
    if (/remote|online|virtual/i.test(searchQuery)) {
      extractedParams.remote = true;
    }
    
    // Look for test types
    const testTypeMap: {[key: string]: string} = {
      'coding': 'Coding Challenge',
      'technical': 'Technical Assessment',
      'cognitive': 'Cognitive Assessment',
      'personality': 'Personality Test',
      'behavioral': 'Behavioral Assessment',
      'collaboration': 'Behavioral Assessment',
      'skill': 'Skills Assessment',
    };
    
    const extractedTypes: string[] = [];
    Object.entries(testTypeMap).forEach(([keyword, testType]) => {
      if (searchQuery.toLowerCase().includes(keyword)) {
        extractedTypes.push(testType);
      }
    });
    
    if (extractedTypes.length > 0) {
      extractedParams.testTypes = extractedTypes;
    }
    
    return extractedParams;
  };

  // Simple text search without embeddings
  const performTextSearch = async (searchQuery: string): Promise<Assessment[]> => {
    const allAssessments = await loadAssessmentData();
    
    if (!searchQuery.trim()) {
      return allAssessments;
    }
    
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    if (keywords.length === 0) {
      return allAssessments;
    }
    
    return allAssessments.filter(assessment => {
      const searchableText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
      return keywords.some(keyword => searchableText.includes(keyword));
    });
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setShowNoResults(false);
    
    console.log(`Performing search with query: "${searchQuery}"`);
    
    try {
      let searchResults: Assessment[] = [];
      
      if (searchQuery.trim() === '') {
        // If empty query, load all assessments
        searchResults = await loadAssessmentData();
        console.log(`Loaded all ${searchResults.length} assessments`);
      } else {
        // Extract parameters from natural language query
        const extractedParams = extractSearchParameters(searchQuery);
        console.log('Extracted parameters from query:', extractedParams);
        
        // Merge extracted parameters with explicit filters, prioritizing explicit ones
        const mergedFilters = {
          remote: filters.remote || extractedParams.remote || undefined,
          adaptive: filters.adaptive || undefined,
          maxDuration: filters.maxDuration !== 120 ? filters.maxDuration : extractedParams.maxDuration,
          testTypes: filters.testTypes.length > 0 ? filters.testTypes : extractedParams.testTypes
        };
        
        console.log('Merged filters:', mergedFilters);
        
        // Try vector search with augmented parameters
        try {
          searchResults = await performVectorSearch({
            query: searchQuery,
            ...mergedFilters
          });
        } catch (error) {
          console.error('Error in vector search, falling back to text search:', error);
          
          // Fall back to simple text search
          const textResults = await performTextSearch(searchQuery);
          
          // Apply filters
          searchResults = textResults.filter(assessment => {
            if (mergedFilters.remote && !assessment.remote_support) return false;
            if (mergedFilters.adaptive && !assessment.adaptive_support) return false;
            if (mergedFilters.maxDuration && assessment.assessment_length > mergedFilters.maxDuration) return false;
            if (mergedFilters.testTypes && mergedFilters.testTypes.length > 0 && 
                !mergedFilters.testTypes.some(type => assessment.test_type.includes(type))) return false;
            return true;
          });
          
          toast.warning('Advanced search unavailable, using basic search instead');
        }
      }
      
      console.log(`Search returned ${searchResults.length} results`);
      setResults(searchResults);
      sessionStorage.setItem('assessment-results', JSON.stringify(searchResults));
      
      if (searchResults.length > 0) {
        toast.success(`Found ${searchResults.length} matching assessments`);
      } else {
        setShowNoResults(true);
        toast.info('No matching assessments found. Try adjusting your filters.');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Failed to load recommendations. Please try again.');
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
