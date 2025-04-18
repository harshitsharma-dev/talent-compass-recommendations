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

const RecommendPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  useEffect(() => {
    const initializeData = async () => {
      setIsModelLoading(true);
      try {
        toast.loading('Loading assessment data and preparing search engine...');
        
        await Promise.all([
          loadAssessmentData(),
          initializeEmbeddings()
        ]);
        
        toast.dismiss();
        toast.success('Search engine ready');
      } catch (error) {
        console.error('Failed to initialize search engine:', error);
        toast.error('Failed to initialize search engine. Some features may be limited.');
      } finally {
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
      
      try {
        results = await performVectorSearch({ query });
      } catch (error) {
        console.error('Error with vector search, falling back to simple filtering:', error);
        
        const allAssessments = await loadAssessmentData();
        
        if (query.trim()) {
          const lowercaseQuery = query.toLowerCase();
          results = allAssessments.filter(assessment => 
            assessment.title.toLowerCase().includes(lowercaseQuery) || 
            assessment.description.toLowerCase().includes(lowercaseQuery) ||
            assessment.test_type.some(type => type.toLowerCase().includes(lowercaseQuery))
          );
        } else {
          results = allAssessments;
        }
        
        toast.warning('Advanced search unavailable, using basic search instead');
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
