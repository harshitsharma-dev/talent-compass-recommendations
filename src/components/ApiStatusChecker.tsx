
import React, { useEffect, useState } from 'react';
import { checkApiHealth } from '@/lib/api/endpoints';
import { Button } from './ui/button';
import { toast } from 'sonner';

const ApiStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const health = await checkApiHealth();
      if (health) {
        setStatus(health.status);
        setTimestamp(health.timestamp);
        toast.success(`API is ${health.status}`);
      } else {
        setStatus('offline');
        setTimestamp(null);
        toast.error('API is offline');
      }
    } catch (error) {
      console.error('Error checking API:', error);
      setStatus('error');
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
