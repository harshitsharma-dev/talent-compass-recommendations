import React from 'react';
import { toast } from 'sonner';
import { checkApiHealth } from '@/lib/api/endpoints';
import { loadAssessmentData } from '@/lib/data/assessmentLoader';
import { initializeEmbeddings } from '@/lib/search/embeddingPersistence';

interface InitializationStatusProps {
  onInitialized: (apiStatus: string | null) => void;
}

const InitializationStatus: React.FC<InitializationStatusProps> = ({ onInitialized }) => {
  React.useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Starting data initialization...');
        toast.loading('Loading assessment data and preparing search engine...', { id: 'init-loading' });
        
        const startTime = Date.now();
        
        // Check API health
        const healthCheck = await checkApiHealth();
        const apiStatus = healthCheck ? healthCheck.status : 'offline';
        
        if (healthCheck) {
          toast.success(`API is ${healthCheck.status}`);
          console.log('API Health check:', healthCheck);
        } else {
          toast.warning('API is currently offline, using local search');
        }
        
        const storedEmbeddings = localStorage.getItem('assessment-embeddings-cache-v1');
        if (storedEmbeddings && JSON.parse(storedEmbeddings) && Object.keys(JSON.parse(storedEmbeddings)).length === 0) {
          console.log('Found empty embeddings cache, clearing it to force regeneration');
          localStorage.removeItem('assessment-embeddings-cache-v1');
        }
        
        const [assessments, embeddings] = await Promise.all([
          loadAssessmentData(),
          initializeEmbeddings()
        ]);
        
        const endTime = Date.now();
        console.log(`Data initialization completed in ${endTime - startTime}ms`);
        console.log(`Loaded ${assessments.length} assessments`);
        
        const embeddingCount = embeddings ? Object.keys(embeddings).length : 0;
        console.log(`Loaded ${embeddingCount} embeddings`);
        
        toast.dismiss('init-loading');
        
        if (embeddingCount > 0) {
          toast.success(`Search engine ready with ${embeddingCount} embeddings`);
        } else {
          console.warn('No embeddings were loaded, basic search will be used');
          toast.warning('Advanced search unavailable, basic search will be used');
        }

        onInitialized(apiStatus);
      } catch (error) {
        console.error('Detailed initialization error:', error);
        toast.dismiss('init-loading');
        toast.error('Failed to initialize search engine. Some features may be limited.');
        onInitialized(null);
      }
    };
    
    initializeData();
  }, [onInitialized]);

  return null;
};

export default InitializationStatus;
