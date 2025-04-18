
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecommendationForm from '@/components/RecommendationForm';
import ExampleCard from '@/components/ExampleCard';
import { toast } from 'sonner';
import { exampleQueries } from '@/lib/mockData';
import { performVectorSearch, loadAssessmentData } from '@/lib/vectorSearch';

const RecommendPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Preload data when the page loads
  React.useEffect(() => {
    // Preload the assessment data in the background
    loadAssessmentData()
      .then(data => {
        console.log(`Preloaded ${data.length} assessments`);
      })
      .catch(error => {
        console.error('Failed to preload assessment data:', error);
      });
  }, []);

  const handleFormSubmit = async (query: string) => {
    try {
      // Show loading state
      setIsLoading(true);
      
      // Show loading toast
      toast.loading('Finding relevant assessments...');

      console.log(`Searching for: "${query}"`);
      // Perform the search
      const results = await performVectorSearch({ query });
      
      console.log(`Found ${results.length} results, storing in session`);
      // Store both query and results in session storage
      sessionStorage.setItem('assessment-query', query);
      sessionStorage.setItem('assessment-results', JSON.stringify(results));
      
      // Clear loading toast and navigate
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
            
            <div className="mb-12">
              <RecommendationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Or try one of these examples:</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {exampleQueries.map((example) => (
                  <ExampleCard
                    key={example.id}
                    title={example.title}
                    description={example.description}
                    onClick={() => handleExampleClick(example)}
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
