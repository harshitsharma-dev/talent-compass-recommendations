
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

const RecommendPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  useEffect(() => {
    const initializeData = async () => {
      setIsModelLoading(true);
      try {
        toast.loading('Initializing search engine...');
        
        await loadAssessmentData();
        
        await performVectorSearch({ query: "initialize model" });
        
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
      const results = await performVectorSearch({ query });
      
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
      
      // Ensure we have data before navigating
      if (allAssessments.length > 0) {
        navigate('/results');
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments. Please try again.');
    } finally {
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
