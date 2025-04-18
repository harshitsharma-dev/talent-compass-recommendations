
import React, { useEffect, useState } from 'react';
import { checkApiHealth } from '@/lib/api/endpoints';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ApiStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await checkApiHealth();
      if (health) {
        setStatus(health.status);
        setTimestamp(health.timestamp);
        toast.success(`API is ${health.status}`);
      } else {
        setStatus('offline');
        setTimestamp(null);
        setError('Could not connect to API endpoints');
        toast.error('API is offline');
      }
    } catch (error: any) {
      console.error('Error checking API:', error);
      setStatus('error');
      setError(error.message || 'Unknown error occurred');
      toast.error('Error checking API status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-2">API Status</h3>
      <div className="flex items-center gap-2 mb-3">
        <div 
          className={`w-3 h-3 rounded-full ${
            status === 'healthy' 
              ? 'bg-green-500' 
              : status === 'offline' 
              ? 'bg-red-500' 
              : 'bg-yellow-500'
          }`}
        />
        <span>
          {status === 'healthy' 
            ? 'API is online' 
            : status === 'offline' 
            ? 'API is offline' 
            : 'Checking API status...'}
        </span>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-3 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'healthy' && (
        <Alert className="mb-3 py-2 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-xs text-green-700">
            API endpoints are working properly
          </AlertDescription>
        </Alert>
      )}
      
      {timestamp && (
        <p className="text-sm text-muted-foreground mb-3">
          Last updated: {new Date(timestamp).toLocaleString()}
        </p>
      )}
      <Button 
        size="sm" 
        variant="outline" 
        onClick={checkStatus}
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check Again'}
      </Button>
    </div>
  );
};

export default ApiStatusChecker;
