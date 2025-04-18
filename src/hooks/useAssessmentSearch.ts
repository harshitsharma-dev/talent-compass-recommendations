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
    maxDuration: 180, // Higher default to avoid filtering
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
        maxDuration: filters.maxDuration !== 180 ? filters.maxDuration : extractedParams.maxDuration || 180,
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
          
          // Store the original API results first, so we always have something to show
          setResults(apiResults);
          
          // If there are active filters besides maxDuration, apply them
          const hasActiveFilters = 
            searchFilters.remote === true || 
            searchFilters.adaptive === true || 
            searchFilters.testTypes.length > 0 ||
            searchFilters.requiredSkills.length > 0;
          
          if (hasActiveFilters) {
            // Apply client-side filtering based on the filters
            const filteredApiResults = strictFilter(apiResults, searchFilters);
            console.log(`After filtering: ${filteredApiResults.length} results remain`);
            
            // If we have filtered results, use them
            if (filteredApiResults.length > 0) {
              setResults(filteredApiResults);
            }
            // Otherwise keep the original results (we set them above)
          }
          
          // Store results in session storage for persistence
          try {
            console.log('Storing results in session storage');
            sessionStorage.setItem('assessment-results', JSON.stringify(results));
            sessionStorage.setItem('assessment-query', searchQuery);
          } catch (storageError) {
            console.warn('Failed to store results in session storage:', storageError);
          }
        } else {
          console.log('No results from API, falling back to vector search');
          throw new Error('No results from API');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        toast.warning('API unavailable, using local search instead');
        
        try {
          console.log('Attempting vector search with force embeddings');
          // Force use of embeddings by setting an explicit flag
          const rankedResults = await performVectorSearch({
            query: searchQuery,
            ...searchFilters,
            forceEmbedding: true
          });
          
          console.log(`Vector search returned ${rankedResults.length} results`);
          
          if (rankedResults.length > 0) {
            setResults(rankedResults);
          } else {
            // If no results from vector search, load all assessments as fallback
            const allAssessments = await loadAssessmentData();
            setResults(allAssessments.slice(0, 20)); // Show first 20 as fallback
            console.log(`Showing ${allAssessments.slice(0, 20).length} assessments as fallback`);
          }
          
          // Store results in session storage for persistence
          try {
            sessionStorage.setItem('assessment-results', JSON.stringify(results));
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
          
          // Fallback to showing all assessments if vector search fails
          const allAssessments = await loadAssessmentData();
          console.log(`Loaded ${allAssessments.length} assessments as fallback`);
          setResults(allAssessments.slice(0, 20)); // Show first 20
          
          // Store results in session storage for persistence
          try {
            sessionStorage.setItem('assessment-results', JSON.stringify(allAssessments.slice(0, 20)));
            sessionStorage.setItem('assessment-query', searchQuery);
          } catch (storageError) {
            console.warn('Failed to store results in session storage:', storageError);
          }
        }
      }
      
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Failed to load recommendations. Please try again.');
      
      // Even after error, try to load some assessments as fallback
      try {
        const allAssessments = await loadAssessmentData();
        setResults(allAssessments.slice(0, 20)); // Show first 20
      } catch (e) {
        setResults([]);
        setShowNoResults(true);
      }
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
            setResults(assessmentResults);
          } else {
            // If no stored results or empty array, load all assessments
            assessmentResults = await loadAssessmentData();
            setResults(assessmentResults.slice(0, 20)); // Show first 20
          }
        } catch (error) {
          console.error('Error parsing stored results:', error);
          assessmentResults = await loadAssessmentData();
          setResults(assessmentResults.slice(0, 20)); // Show first 20
        }
      } else {
        console.log('No stored results found, loading all assessments');
        assessmentResults = await loadAssessmentData();
        setResults(assessmentResults.slice(0, 20)); // Show first 20
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
