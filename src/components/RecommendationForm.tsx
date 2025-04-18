
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendationFormProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onSubmit, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSubmit(query);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="job-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Job Description
        </label>
        <Textarea
          id="job-description"
          placeholder="Paste job description or hiring query here..."
          className="min-h-[200px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
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
