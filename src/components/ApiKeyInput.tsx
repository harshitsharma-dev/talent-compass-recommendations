
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setIsKeySet(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.startsWith('sk-')) {
      toast.error('Please enter a valid OpenAI API key starting with "sk-"');
      return;
    }
    localStorage.setItem('openai_api_key', apiKey);
    setIsKeySet(true);
    toast.success('API key saved successfully');
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setIsKeySet(false);
    toast.info('API key removed');
  };

  if (isKeySet) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">OpenAI API key is set</span>
        <Button variant="outline" size="sm" onClick={handleRemoveKey}>
          Remove Key
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Enter your OpenAI API key to enable advanced search capabilities
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="max-w-md"
        />
        <Button onClick={handleSaveKey}>Save Key</Button>
      </div>
    </div>
  );
};
