
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import UrlContentInput from './url-input/UrlContentInput';
import DescriptionInput from './description/DescriptionInput';

interface RecommendationFormProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onSubmit, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query);
  };

  const handleUrlContent = (content: string) => {
    setQuery(prevQuery => {
      const newQuery = prevQuery.trim() ? `${prevQuery}\n\nContent from URL:\n${content}` : content;
      return newQuery;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UrlContentInput onContentExtracted={handleUrlContent} />
      <DescriptionInput value={query} onChange={setQuery} />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!query.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Finding Assessments...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Get Recommendations
          </>
        )}
      </Button>
    </form>
  );
};

export default RecommendationForm;
