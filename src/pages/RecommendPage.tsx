
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecommendationForm from '@/components/RecommendationForm';
import ExampleCard from '@/components/ExampleCard';
import { toast } from 'sonner';
import { exampleQueries } from '@/lib/mockData';
import { performVectorSearch } from '@/lib/search/vectorSearch';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { initializeEmbeddings } from '@/lib/search/embeddingPersistence';
import { checkApiHealth, getRecommendations } from '@/lib/api/endpoints';

const RecommendPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeData = async () => {
      setIsModelLoading(true);
      try {
        console.log('Starting data initialization...');
        toast.loading('Loading assessment data and preparing search engine...', { id: 'init-loading' });
        
        const startTime = Date.now();
        
        // Check API health
        const healthCheck = await checkApiHealth();
        if (healthCheck) {
          setApiStatus(healthCheck.status);
          toast.success(`API is ${healthCheck.status}`);
          console.log('API Health check:', healthCheck);
        } else {
          setApiStatus('offline');
          toast.warning('API is currently offline, using local search');
        }
        
        const storedEmbeddings = localStorage.getItem('assessment-embeddings-cache-v1');
        if (storedEmbeddings && JSON.parse(storedEmbeddings) && Object.keys(JSON.parse(storedEmbeddings)).length === 0) {
          console.log('Found empty embeddings cache, clearing it to force regeneration');
          localStorage.removeItem('assessment-embeddings-cache-v1');
        }
        
        const [assessments, embeddings] = await Promise.all([
          loadAssessmentData(),
          initializeEmbeddings()
        ]);
        
        const endTime = Date.now();
        console.log(`Data initialization completed in ${endTime - startTime}ms`);
        console.log(`Loaded ${assessments.length} assessments`);
        
        const embeddingCount = embeddings ? Object.keys(embeddings).length : 0;
        console.log(`Loaded ${embeddingCount} embeddings`);
        
        toast.dismiss('init-loading');
        
        if (embeddingCount > 0) {
          toast.success(`Search engine ready with ${embeddingCount} embeddings`);
        } else {
          console.warn('No embeddings were loaded, basic search will be used');
          toast.warning('Advanced search unavailable, basic search will be used');
        }
      } catch (error) {
        console.error('Detailed initialization error:', error);
        toast.dismiss('init-loading');
        toast.error('Failed to initialize search engine. Some features may be limited.');
      } finally {
        console.log('Setting isModelLoading to false');
        setIsModelLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const handleFormSubmit = async (query: string) => {
    try {
      setIsLoading(true);
      toast.loading('Finding relevant assessments...');
      
      console.log(`Searching for: "${query}"`);
      let results;
      
      // Try using the API first if available
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

  const handleExampleClick = async (example: typeof exampleQueries[0]) => {
    await handleFormSubmit(example.description);
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
        setIsLoading(false);
        return;
      }
      
      sessionStorage.setItem('assessment-query', '');
      sessionStorage.setItem('assessment-results', JSON.stringify(allAssessments));
      
      toast.dismiss();
      toast.success(`Found ${allAssessments.length} assessments`);
      
      setTimeout(() => {
        navigate('/results', { replace: true });
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="container px-4 mx-auto sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Find the Right Assessment Tools</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Enter a job description or hiring requirements, and our AI will recommend the most suitable assessment tools for your needs.
            </p>
            
            {apiStatus && (
              <div className={`mb-4 p-3 rounded border ${apiStatus === 'healthy' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <p className="text-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${apiStatus === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  API Status: 
                  <span className={`font-medium ${apiStatus === 'healthy' ? 'text-green-700' : 'text-yellow-700'}`}>
                    {apiStatus === 'healthy' ? 'Online' : 'Offline (using local search)'}
                  </span>
                </p>
              </div>
            )}
            
            <div className="mb-8">
              <ApiKeyInput />
            </div>
            
            {isModelLoading ? (
              <div className="flex flex-col items-center justify-center py-8 mb-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">
                  Initializing AI search engine...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a moment on first load.
                </p>
              </div>
            ) : (
              <div className="mb-12">
                <RecommendationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleSeeAll}
                    disabled={isLoading || isModelLoading}
                    className="gap-2"
                  >
                    <Eye size={16} />
                    See All Assessments
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Or try one of these examples:</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {exampleQueries.map((example) => (
                  <ExampleCard
                    key={example.id}
                    title={example.title}
                    description={example.description}
                    onClick={() => handleExampleClick(example)}
                    disabled={isModelLoading || isLoading}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RecommendPage;
