
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { performVectorSearch } from '@/lib/search/vectorSearch';
import { getRecommendations } from '@/lib/api/endpoints';

export const useSearchHandler = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const performLocalSearch = async (query: string) => {
    try {
      return await performVectorSearch({ query });
    } catch (error) {
      console.error('Error with vector search, falling back to simple filtering:', error);
      
      const allAssessments = await loadAssessmentData();
      
      if (query.trim()) {
        const lowercaseQuery = query.toLowerCase();
        return allAssessments.filter(assessment => 
          assessment.title.toLowerCase().includes(lowercaseQuery) || 
          assessment.description.toLowerCase().includes(lowercaseQuery) ||
          assessment.test_type.some(type => type.toLowerCase().includes(lowercaseQuery))
        );
      } else {
        return allAssessments;
      }
    }
  };

  const handleSearch = async (query: string, apiStatus: string | null) => {
    try {
      setIsLoading(true);
      toast.loading('Finding relevant assessments...');
      
      console.log(`Searching for: "${query}"`);
      let results;
      
      if (apiStatus === 'healthy') {
        try {
          console.log('Using API for recommendations');
          results = await getRecommendations(query);
          console.log('API results:', results);
        } catch (apiError) {
          console.error('API recommendation error, falling back to local search:', apiError);
          results = await performLocalSearch(query);
        }
      } else {
        console.log('API not available, using local search');
        results = await performLocalSearch(query);
      }
      
      console.log(`Found ${results.length} results, storing in session`);
      sessionStorage.setItem('assessment-query', query);
      sessionStorage.setItem('assessment-results', JSON.stringify(results));
      
      toast.dismiss();
      
      if (results.length > 0) {
        toast.success(`Found ${results.length} matching assessments`);
      } else {
        toast.info('No matching assessments found. Try a different query.');
      }
      
      navigate('/results');
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeeAll = async () => {
    try {
      setIsLoading(true);
      toast.loading('Loading all assessments...');
      
      console.log('Attempting to load all assessments...');
      const allAssessments = await loadAssessmentData();
      console.log(`Retrieved ${allAssessments.length} assessments for "See All"`);
      
      if (allAssessments.length === 0) {
        toast.error('No assessment data available. Please try again later.');
        return;
      }
      
      sessionStorage.setItem('assessment-query', '');
      sessionStorage.setItem('assessment-results', JSON.stringify(allAssessments));
      
      toast.dismiss();
      toast.success(`Found ${allAssessments.length} assessments`);
      
      setTimeout(() => {
        navigate('/results', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSearch, handleSeeAll };
};
