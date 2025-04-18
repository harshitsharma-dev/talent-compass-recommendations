
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AssessmentCard from '@/components/AssessmentCard';
import FilterOptions from '@/components/FilterOptions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { performVectorSearch, loadAssessmentData } from '@/lib/vectorSearch';
import { Assessment } from '@/lib/mockData';
import { ArrowLeft, Loader2, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

const ResultsPage = () => {
  const navigate = useNavigate();
  
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [remote, setRemote] = useState<boolean>(false);
  const [adaptive, setAdaptive] = useState<boolean>(false);
  const [maxDuration, setMaxDuration] = useState<number>(120);
  const [testTypes, setTestTypes] = useState<string[]>([]);
  const [showNoResults, setShowNoResults] = useState<boolean>(false);

  // Preload CSV data when component mounts
  useEffect(() => {
    console.log('ResultsPage: Loading assessment data');
    loadAssessmentData()
      .then(data => {
        console.log(`ResultsPage: Successfully loaded ${data.length} assessments`);
      })
      .catch(error => {
        console.error('Failed to preload assessment data:', error);
        toast.error('Failed to load assessment data');
      });
  }, []);

  // Fetch query from session storage and perform search
  useEffect(() => {
    console.log('ResultsPage: Checking for stored search data');
    const storedQuery = sessionStorage.getItem('assessment-query');
    const storedResults = sessionStorage.getItem('assessment-results');
    
    if (!storedQuery) {
      console.log('No query found in session storage, redirecting to search page');
      navigate('/recommend');
      return;
    }
    
    console.log(`Found stored query: "${storedQuery}"`);
    setQuery(storedQuery);
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        console.log(`Loaded ${parsedResults.length} results from session storage`);
        setResults(parsedResults);
        setShowNoResults(parsedResults.length === 0);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing stored results:', error);
        performSearch(storedQuery); // Fall back to new search if parse fails
      }
    } else {
      console.log('No results in session storage, performing new search');
      performSearch(storedQuery);
    }
  }, [navigate]);

  // Re-run search when filters change
  useEffect(() => {
    if (query && !loading) {
      console.log('Filters changed, re-running search');
      performSearch(query);
    }
  }, [remote, adaptive, maxDuration, testTypes]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setShowNoResults(false);
    
    console.log(`Performing search with query: "${searchQuery}"`);
    console.log('Filters:', { remote, adaptive, maxDuration, testTypes });
    
    try {
      const searchResults = await performVectorSearch({
        query: searchQuery,
        remote: remote || undefined,
        adaptive: adaptive || undefined,
        maxDuration: maxDuration !== 120 ? maxDuration : undefined,
        testTypes: testTypes.length > 0 ? testTypes : undefined
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

  const handleNewSearch = () => {
    const searchInput = document.getElementById('quick-search') as HTMLInputElement;
    if (searchInput && searchInput.value.trim()) {
      performSearch(searchInput.value);
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
          
          {/* Search summary and quick search */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3">Assessment Recommendations</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
              <p className="text-muted-foreground flex-shrink-0">
                Based on your query: <span className="font-medium text-foreground">{query}</span>
              </p>
              <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                <Input 
                  id="quick-search" 
                  placeholder="Refine your search..." 
                  className="max-w-xs"
                  defaultValue={query}
                />
                <Button onClick={handleNewSearch} className="whitespace-nowrap">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filter sidebar - hidden on mobile */}
            <div className="hidden md:block w-full md:w-64 flex-shrink-0">
              <Card className="sticky top-6 p-6">
                <FilterOptions
                  remote={remote}
                  setRemote={setRemote}
                  adaptive={adaptive}
                  setAdaptive={setAdaptive}
                  maxDuration={maxDuration}
                  setMaxDuration={setMaxDuration}
                  testTypes={testTypes}
                  setTestTypes={setTestTypes}
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
                      remote={remote}
                      setRemote={setRemote}
                      adaptive={adaptive}
                      setAdaptive={setAdaptive}
                      maxDuration={maxDuration}
                      setMaxDuration={setMaxDuration}
                      testTypes={testTypes}
                      setTestTypes={setTestTypes}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Results area */}
            <div className="flex-grow min-w-0">
              {loading ? (
                // Loading state
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Finding the best assessment tools...</p>
                </div>
              ) : showNoResults ? (
                // No results state
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No matching assessments found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Try adjusting your filters or search query to find more assessments.
                  </p>
                  <Button onClick={() => navigate('/recommend')}>
                    Try a Different Search
                  </Button>
                </div>
              ) : (
                // Results grid
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {results.map((assessment) => (
                    <AssessmentCard key={assessment.id} assessment={assessment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
