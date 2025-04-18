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

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setShowNoResults(false);
    
    console.log(`Performing search with query: "${searchQuery}"`);
    console.log('Filters:', filters);
    
    try {
      let searchResults: Assessment[] = [];
      
      if (searchQuery.trim() === '') {
        // If empty query, load all assessments
        searchResults = await loadAssessmentData();
        console.log(`Loaded all ${searchResults.length} assessments`);
      } else {
        // Otherwise perform vector search
        try {
          searchResults = await performVectorSearch({
            query: searchQuery,
            remote: filters.remote || undefined,
            adaptive: filters.adaptive || undefined,
            maxDuration: filters.maxDuration !== 120 ? filters.maxDuration : undefined,
            testTypes: filters.testTypes.length > 0 ? filters.testTypes : undefined
          });
        } catch (error) {
          console.error('Error in vector search, falling back to all assessments:', error);
          searchResults = await loadAssessmentData();
          toast.error('Search engine unavailable. Showing all assessments.');
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
  };
};
