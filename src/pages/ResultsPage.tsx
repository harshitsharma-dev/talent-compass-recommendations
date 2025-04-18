
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterOptions from '@/components/FilterOptions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAssessmentSearch } from '@/hooks/useAssessmentSearch';
import SearchSummary from '@/components/search/SearchSummary';
import SearchResults from '@/components/search/SearchResults';
import { toast } from 'sonner';

const ResultsPage = () => {
  const navigate = useNavigate();
  
  // Initialize search state and handlers with loadInitialData
  const {
    query,
    setQuery,
    results,
    loading,
    showNoResults,
    filters,
    updateFilters,
    performSearch,
    loadInitialData
  } = useAssessmentSearch('');

  // Load data from session storage and perform search
  useEffect(() => {
    console.log('ResultsPage: Loading initial data');
    
    const storedQuery = sessionStorage.getItem('assessment-query');
    if (storedQuery) {
      console.log('Found stored query:', storedQuery);
      setQuery(storedQuery);
    }
    
    loadInitialData().then(() => {
      console.log('Initial data loaded:', results.length, 'results');
      
      // If no results and we have a query, try performing the search again with relaxed criteria
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

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters);
    updateFilters(newFilters);
    
    // Re-run the search with updated filters if we have a query
    if (query) {
      performSearch(query);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="container px-4 mx-auto sm:px-6">
          {/* Back navigation */}
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
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filter sidebar - hidden on mobile */}
            <div className="hidden md:block w-full md:w-64 flex-shrink-0">
              <Card className="sticky top-6 p-6">
                <FilterOptions
                  remote={filters.remote}
                  setRemote={(value) => handleFilterChange({ remote: value })}
                  adaptive={filters.adaptive}
                  setAdaptive={(value) => handleFilterChange({ adaptive: value })}
                  maxDuration={filters.maxDuration}
                  setMaxDuration={(value) => handleFilterChange({ maxDuration: value })}
                  testTypes={filters.testTypes}
                  setTestTypes={(value) => handleFilterChange({ testTypes: value })}
                />
              </Card>
            </div>
            
            {/* Mobile filter sheet */}
            <div className="md:hidden mb-4 flex justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter size={16} />
                    Filter Options
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="py-6">
                    <FilterOptions
                      remote={filters.remote}
                      setRemote={(value) => handleFilterChange({ remote: value })}
                      adaptive={filters.adaptive}
                      setAdaptive={(value) => handleFilterChange({ adaptive: value })}
                      maxDuration={filters.maxDuration}
                      setMaxDuration={(value) => handleFilterChange({ maxDuration: value })}
                      testTypes={filters.testTypes}
                      setTestTypes={(value) => handleFilterChange({ testTypes: value })}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Results area */}
            <div className="flex-grow min-w-0">
              <SearchResults 
                loading={loading}
                showNoResults={showNoResults || (!loading && results.length === 0)}
                results={results}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
