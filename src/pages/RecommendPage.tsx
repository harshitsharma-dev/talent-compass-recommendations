
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecommendationForm from '@/components/RecommendationForm';
import ExampleCard from '@/components/ExampleCard';
import { exampleQueries } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import InitializationStatus from '@/components/recommend/InitializationStatus';
import LoadingState from '@/components/recommend/LoadingState';
import { useSearchHandler } from '@/hooks/useSearchHandler';

const RecommendPage = () => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const { isLoading, handleSearch, handleSeeAll } = useSearchHandler();

  const handleInitialized = (status: string | null) => {
    setApiStatus(status);
    setIsModelLoading(false);
  };

  const handleExampleClick = async (example: typeof exampleQueries[0]) => {
    await handleSearch(example.description, apiStatus);
  };

  const handleFormSubmit = async (query: string) => {
    await handleSearch(query, apiStatus);
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
            
            <InitializationStatus onInitialized={handleInitialized} />
            
            {isModelLoading ? (
              <LoadingState />
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
