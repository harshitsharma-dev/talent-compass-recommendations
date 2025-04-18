
import React from 'react';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Assessment } from '@/lib/mockData';
import AssessmentCard from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchResultsProps {
  loading: boolean;
  showNoResults: boolean;
  results: Assessment[];
}

const SearchResults = ({ loading, showNoResults, results }: SearchResultsProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Finding the best assessment tools...</p>
      </div>
    );
  }

  // If there are results, show them prominently
  if (results.length > 0) {
    return (
      <div className="space-y-6 w-full">
        <p className="text-sm text-muted-foreground pb-4 font-semibold">
          Showing {results.length} {results.length === 1 ? 'assessment' : 'assessments'} based on semantic search
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {results.map((assessment) => (
            <AssessmentCard 
              key={assessment.id} 
              assessment={assessment} 
              className="shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out" 
            />
          ))}
        </div>
      </div>
    );
  }

  // No results state
  if (showNoResults) {
    return (
      <div className="space-y-8 w-full">
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            No matching assessments found. Our semantic search couldn't locate relevant results.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col items-center justify-center py-16 text-center w-full">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Semantic Matches Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Our advanced semantic search couldn't find assessments matching your query.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/recommend')} className="mt-4">
              Try Another Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Reset Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SearchResults;
