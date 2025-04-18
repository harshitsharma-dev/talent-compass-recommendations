
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

  // If there are results, show them
  if (results.length > 0) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground pb-4">
          Showing {results.length} {results.length === 1 ? 'assessment' : 'assessments'} based on your criteria.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {results.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      </div>
    );
  }

  if (showNoResults) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            No matching assessments found. Try adjusting your search criteria or filters.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No matching assessments found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Try broadening your search criteria by:
          </p>
          <ul className="text-left text-muted-foreground mb-6 space-y-2">
            <li>• Using fewer filters</li>
            <li>• Trying more general search terms</li>
            <li>• Checking for typos in your search query</li>
            <li>• Increasing the maximum duration value</li>
          </ul>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/recommend')} className="mt-4">
              Try a Different Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SearchResults;
