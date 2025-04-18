
import { useState, useCallback } from 'react';
import { Assessment } from '@/lib/mockData';
import { performVectorSearch } from '@/lib/search/vectorSearch';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { toast } from 'sonner';

export const useAssessmentSearch = (initialQuery: string) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNoResults, setShowNoResults] = useState<boolean>(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setShowNoResults(false);
    
    console.log(`Performing search with query: "${searchQuery}"`);
    
    try {
      try {
        const rankedResults = await performVectorSearch({
          query: searchQuery
        });
        
        setResults(rankedResults);
        sessionStorage.setItem('assessment-results', JSON.stringify(rankedResults));
        
        if (rankedResults.length === 0) {
          setShowNoResults(true);
          console.log('No results found after vector search');
        }
      } catch (error) {
        console.error('Vector search error:', error);
        setShowNoResults(true);
        toast.warning('Advanced search unavailable, showing all results');
        
        const allAssessments = await loadAssessmentData();
        setResults(allAssessments.slice(0, 10));
      }
      
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Failed to load recommendations. Please try again.');
      setResults([]);
      setShowNoResults(true);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    query,
    setQuery,
    results,
    setResults,
    loading,
    showNoResults,
    performSearch,
    loadInitialData,
  };
};
