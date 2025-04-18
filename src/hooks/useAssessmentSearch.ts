
import { useState, useCallback, useEffect } from 'react';
import { Assessment } from '@/lib/mockData';
import { performVectorSearch } from '@/lib/search/vectorSearch';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { toast } from 'sonner';
import { SearchFilters } from '@/types/search';
import { extractSearchParameters } from '@/utils/search/parameterExtraction';
import { strictFilter } from '@/utils/search/filterOperations';

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

  // Debug filter state on any change
  useEffect(() => {
    console.log('Current filters:', filters);
  }, [filters]);

  // Complete search pipeline implementation
  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setShowNoResults(false);
    
    console.log(`Performing search with query: "${searchQuery}"`);
    
    try {
      // Extract parameters/constraints from query
      const extractedParams = extractSearchParameters(searchQuery);
      console.log('Extracted parameters:', extractedParams);
      
      // Merge extracted parameters with explicit filters
      const searchFilters = {
        remote: filters.remote || extractedParams.remote || false,
        adaptive: filters.adaptive || extractedParams.adaptive || false,
        maxDuration: filters.maxDuration !== 120 ? filters.maxDuration : extractedParams.maxDuration || 120,
        testTypes: filters.testTypes.length > 0 ? filters.testTypes : extractedParams.testTypes || [],
        requiredSkills: extractedParams.requiredSkills || [],
      };
      
      console.log('Applied search filters:', searchFilters);
      
      try {
        const rankedResults = await performVectorSearch({
          query: searchQuery,
          ...searchFilters
        });
        
        console.log(`Search returned ${rankedResults.length} results`);
        setResults(rankedResults);
        
        // Store results in session storage for persistence
        try {
          sessionStorage.setItem('assessment-results', JSON.stringify(rankedResults));
        } catch (storageError) {
          console.warn('Failed to store results in session storage:', storageError);
        }
        
        if (rankedResults.length === 0) {
          setShowNoResults(true);
          console.log('No results found after vector search');
        }
      } catch (error) {
        console.error('Vector search error:', error);
        setShowNoResults(true);
        toast.warning('Advanced search unavailable, using basic search instead');
        
        // Fallback to basic filtering if vector search fails
        const allAssessments = await loadAssessmentData();
        const filteredResults = strictFilter(allAssessments, searchFilters).slice(0, 10);
        
        setResults(filteredResults);
        if (filteredResults.length === 0) {
          setShowNoResults(true);
        }
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

  // Load initial data function
  const loadInitialData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setShowNoResults(false);
    
    try {
      const storedResults = sessionStorage.getItem('assessment-results');
      let assessmentResults: Assessment[] = [];
      
      if (storedResults) {
        console.log('Loading results from session storage');
        try {
          assessmentResults = JSON.parse(storedResults);
          console.log(`Loaded ${assessmentResults.length} results from session storage`);
        } catch (error) {
          console.error('Error parsing stored results:', error);
          assessmentResults = await loadAssessmentData();
        }
      } else {
        console.log('No stored results found, loading all assessments');
        assessmentResults = await loadAssessmentData();
      }
      
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
    console.log('Updating filters:', newFilters);
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
