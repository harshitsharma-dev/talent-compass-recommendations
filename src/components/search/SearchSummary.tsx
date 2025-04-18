
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchSummaryProps {
  query: string;
  onSearch: (query: string) => void;
}

const SearchSummary = ({ query, onSearch }: SearchSummaryProps) => {
  const handleNewSearch = () => {
    const searchInput = document.getElementById('quick-search') as HTMLInputElement;
    if (searchInput && searchInput.value.trim()) {
      onSearch(searchInput.value);
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-3">Assessment Recommendations</h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
        <p className="text-muted-foreground flex-shrink-0">
          {query ? (
            <>Based on your query: <span className="font-medium text-foreground">{query}</span></>
          ) : (
            <span>Showing all available assessments</span>
          )}
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
  );
};

export default SearchSummary;
