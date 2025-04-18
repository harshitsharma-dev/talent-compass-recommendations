
import React from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Assessment } from '@/lib/mockData';
import AssessmentCard from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';

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

  if (showNoResults) {
    return (
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
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {results.map((assessment) => (
        <AssessmentCard key={assessment.id} assessment={assessment} />
      ))}
    </div>
  );
};

export default SearchResults;
