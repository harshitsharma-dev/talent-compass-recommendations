
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SupportFilterProps {
  remote: boolean;
  onRemoteChange: (value: boolean) => void;
  adaptive: boolean;
  onAdaptiveChange: (value: boolean) => void;
}

const SupportFilter: React.FC<SupportFilterProps> = ({
  remote,
  onRemoteChange,
  adaptive,
  onAdaptiveChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remote" 
          checked={remote} 
          onCheckedChange={() => onRemoteChange(!remote)}
        />
        <Label htmlFor="remote">Remote Testing Available</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="adaptive" 
          checked={adaptive} 
          onCheckedChange={() => onAdaptiveChange(!adaptive)}
        />
        <Label htmlFor="adaptive">Adaptive Testing</Label>
      </div>
    </div>
  );
};

export default SupportFilter;
