
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

const ResultsPage = () => {
  const navigate = useNavigate();
  
  // Initialize search state and handlers
  const {
    query,
    setQuery,
    results,
    loading,
    showNoResults,
    filters,
    updateFilters,
    performSearch
  } = useAssessmentSearch('');

  // Fetch query from session storage and perform search
  useEffect(() => {
    console.log('ResultsPage: Checking for stored search data');
    const storedQuery = sessionStorage.getItem('assessment-query');
    
    if (!storedQuery) {
      console.log('No query found in session storage, redirecting to search page');
      navigate('/recommend');
      return;
    }
    
    setQuery(storedQuery);
    performSearch(storedQuery);
  }, [navigate, setQuery]);

  // Re-run search when filters change
  useEffect(() => {
    if (query && !loading) {
      console.log('Filters changed, re-running search');
      performSearch(query);
    }
  }, [filters, query]);

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
                  setRemote={(value) => updateFilters({ remote: value })}
                  adaptive={filters.adaptive}
                  setAdaptive={(value) => updateFilters({ adaptive: value })}
                  maxDuration={filters.maxDuration}
                  setMaxDuration={(value) => updateFilters({ maxDuration: value })}
                  testTypes={filters.testTypes}
                  setTestTypes={(value) => updateFilters({ testTypes: value })}
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
                      setRemote={(value) => updateFilters({ remote: value })}
                      adaptive={filters.adaptive}
                      setAdaptive={(value) => updateFilters({ adaptive: value })}
                      maxDuration={filters.maxDuration}
                      setMaxDuration={(value) => updateFilters({ maxDuration: value })}
                      testTypes={filters.testTypes}
                      setTestTypes={(value) => updateFilters({ testTypes: value })}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Results area */}
            <div className="flex-grow min-w-0">
              <SearchResults 
                loading={loading}
                showNoResults={showNoResults}
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
