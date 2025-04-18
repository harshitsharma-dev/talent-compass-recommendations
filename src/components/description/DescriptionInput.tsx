
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label 
        htmlFor="job-description" 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Job Description or URL Content
      </label>
      <Textarea
        id="job-description"
        placeholder="Paste job description, hiring query, or content from URL will appear here..."
        className="min-h-[200px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default DescriptionInput;
