
import { useState, useCallback, useEffect } from 'react';
import { Assessment } from '@/lib/mockData';
import { performVectorSearch } from '@/lib/search/vectorSearch';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { toast } from 'sonner';
import { SearchFilters } from '@/types/search';
import { extractSearchParameters } from '@/utils/search/parameterExtraction';
import { strictFilter } from '@/utils/search/filterOperations';
import { getRecommendations } from '@/lib/api/endpoints';

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
      
      // First try the API endpoint
      try {
        console.log('Attempting to get recommendations from API endpoint');
        const apiResults = await getRecommendations(searchQuery);
        console.log(`API returned ${apiResults.length} results:`, apiResults);
        
        if (apiResults && apiResults.length > 0) {
          console.log('Using API results');
          
          // Apply client-side filtering based on the filters
          const filteredApiResults = strictFilter(apiResults, searchFilters);
          console.log(`After filtering: ${filteredApiResults.length} results remain`);
          
          setResults(filteredApiResults);
          
          // Store results in session storage for persistence
          try {
            console.log('Storing results in session storage');
            sessionStorage.setItem('assessment-results', JSON.stringify(filteredApiResults));
            sessionStorage.setItem('assessment-query', searchQuery);
          } catch (storageError) {
            console.warn('Failed to store results in session storage:', storageError);
          }
          
          if (filteredApiResults.length === 0) {
            console.log('No results after filtering API results');
            setShowNoResults(true);
          }
        } else {
          console.log('No results from API, falling back to vector search');
          throw new Error('No results from API');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        toast.warning('API unavailable, using local search instead');
        
        try {
          console.log('Attempting vector search');
          const rankedResults = await performVectorSearch({
            query: searchQuery,
            ...searchFilters
          });
          
          console.log(`Vector search returned ${rankedResults.length} results`);
          setResults(rankedResults);
          
          // Store results in session storage for persistence
          try {
            sessionStorage.setItem('assessment-results', JSON.stringify(rankedResults));
            sessionStorage.setItem('assessment-query', searchQuery);
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
          console.log(`Loaded ${allAssessments.length} assessments for basic filtering`);
          
          const filteredResults = strictFilter(allAssessments, searchFilters).slice(0, 10);
          console.log(`Basic filtering returned ${filteredResults.length} results`);
          
          setResults(filteredResults);
          if (filteredResults.length === 0) {
            setShowNoResults(true);
          }
          
          // Store results in session storage for persistence
          try {
            sessionStorage.setItem('assessment-results', JSON.stringify(filteredResults));
            sessionStorage.setItem('assessment-query', searchQuery);
          } catch (storageError) {
            console.warn('Failed to store results in session storage:', storageError);
          }
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
    
    console.log('loadInitialData: Starting to load initial data');
    
    try {
      const storedResults = sessionStorage.getItem('assessment-results');
      const storedQuery = sessionStorage.getItem('assessment-query');
      
      console.log('Session storage state:', { 
        hasStoredResults: !!storedResults, 
        hasStoredQuery: !!storedQuery
      });
      
      let assessmentResults: Assessment[] = [];
      
      if (storedResults) {
        console.log('Loading results from session storage');
        try {
          assessmentResults = JSON.parse(storedResults);
          console.log(`Loaded ${assessmentResults.length} results from session storage`);
          
          if (assessmentResults.length > 0) {
            console.log('Sample result from storage:', assessmentResults[0]);
          }
        } catch (error) {
          console.error('Error parsing stored results:', error);
          assessmentResults = await loadAssessmentData();
        }
      } else {
        console.log('No stored results found, loading all assessments');
        assessmentResults = await loadAssessmentData();
      }
      
      console.log(`Setting ${assessmentResults.length} results to state`);
      setResults(assessmentResults);
      
      if (assessmentResults.length === 0) {
        console.log('No results to display, showing no results message');
        setShowNoResults(true);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load assessment data');
      return Promise.reject(error);
    } finally {
      setLoading(false);
      console.log('loadInitialData: Finished loading initial data');
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
