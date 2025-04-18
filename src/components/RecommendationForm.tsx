
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Link } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { extractContentFromUrl, isValidUrl } from '@/lib/search/urlContentExtractor';
import { toast } from 'sonner';

interface RecommendationFormProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onSubmit, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [url, setUrl] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  const handleUrlContent = async () => {
    if (!url.trim() || !isValidUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setIsProcessingUrl(true);
      const content = await extractContentFromUrl(url);
      
      if (!content) {
        toast.error('Could not extract content from the URL');
        return;
      }

      setQuery(prevQuery => {
        const newQuery = prevQuery.trim() ? `${prevQuery}\n\nContent from URL:\n${content}` : content;
        return newQuery;
      });
      
      toast.success('Successfully added content from URL');
      setUrl('');
    } catch (error) {
      console.error('Error processing URL:', error);
      toast.error('Failed to process URL');
    } finally {
      setIsProcessingUrl(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Add content from URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUrlContent}
          disabled={isProcessingUrl || !url.trim()}
        >
          {isProcessingUrl ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <label htmlFor="job-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Job Description or URL Content
        </label>
        <Textarea
          id="job-description"
          placeholder="Paste job description, hiring query, or content from URL will appear here..."
          className="min-h-[200px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!query.trim() || isLoading || isProcessingUrl}
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
