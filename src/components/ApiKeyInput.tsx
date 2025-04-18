
import React from 'react';

export const ApiKeyInput = () => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Advanced search is enabled. Try queries like:
      </p>
      <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
        <li>Python and SQL technical assessment under 60 minutes</li>
        <li>Behavioral test for mid-level analyst</li>
        <li>Remote JavaScript coding challenge</li>
      </ul>
    </div>
  );
};
