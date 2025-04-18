
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAssessmentSearch } from '@/hooks/useAssessmentSearch';
import SearchSummary from '@/components/search/SearchSummary';
import SearchResults from '@/components/search/SearchResults';
import { toast } from 'sonner';

const ResultsPage = () => {
  const navigate = useNavigate();
  
  const {
    query,
    setQuery,
    results,
    loading,
    showNoResults,
    performSearch,
    loadInitialData
  } = useAssessmentSearch('');

  useEffect(() => {
    console.log('ResultsPage: Loading initial data');
    
    const storedQuery = sessionStorage.getItem('assessment-query');
    if (storedQuery) {
      console.log('Found stored query:', storedQuery);
      setQuery(storedQuery);
    }
    
    loadInitialData().then(() => {
      console.log('Initial data loaded:', results.length, 'results');
      
      if (results.length === 0 && storedQuery) {
        console.log('No stored results found, attempting search again with query:', storedQuery);
        performSearch(storedQuery);
      }
    }).catch((error) => {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load assessment data');
      navigate('/recommend');
    });
  }, [loadInitialData, navigate, setQuery, performSearch, results.length]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="container px-4 mx-auto sm:px-6">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/recommend')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back to Search
            </Button>
          </div>
          
          <SearchSummary query={query} onSearch={performSearch} />
          
          <div className="w-full">
            <SearchResults 
              loading={loading}
              showNoResults={showNoResults || (!loading && results.length === 0)}
              results={results}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
