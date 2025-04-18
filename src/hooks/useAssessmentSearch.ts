
import { useState, useEffect } from 'react';
import { Assessment } from '@/lib/mockData';
import { performVectorSearch, loadAssessmentData } from '@/lib/search/vectorSearch';
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

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setShowNoResults(false);
    
    console.log(`Performing search with query: "${searchQuery}"`);
    console.log('Filters:', filters);
    
    try {
      const searchResults = await performVectorSearch({
        query: searchQuery,
        remote: filters.remote || undefined,
        adaptive: filters.adaptive || undefined,
        maxDuration: filters.maxDuration !== 120 ? filters.maxDuration : undefined,
        testTypes: filters.testTypes.length > 0 ? filters.testTypes : undefined
      });
      
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
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    query,
    setQuery,
    results,
    loading,
    showNoResults,
    filters,
    updateFilters,
    performSearch,
  };
};
