
import React from 'react';

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 mb-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
    <p className="text-muted-foreground">
      Initializing AI search engine...
    </p>
    <p className="text-sm text-muted-foreground mt-2">
      This may take a moment on first load.
    </p>
  </div>
);

export default LoadingState;
