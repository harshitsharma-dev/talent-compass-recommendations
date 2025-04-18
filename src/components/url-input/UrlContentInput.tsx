
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Link } from 'lucide-react';
import { extractContentFromUrl, isValidUrl } from '@/lib/search/urlContentExtractor';
import { toast } from 'sonner';

interface UrlContentInputProps {
  onContentExtracted: (content: string) => void;
}

const UrlContentInput: React.FC<UrlContentInputProps> = ({ onContentExtracted }) => {
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

      onContentExtracted(content);
      toast.success('Successfully added content from URL');
      setUrl('');
    } catch (error) {
      console.error('Error processing URL:', error);
      toast.error('Failed to process URL');
    } finally {
      setIsProcessingUrl(false);
    }
  };

  return (
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
  );
};

export default UrlContentInput;
