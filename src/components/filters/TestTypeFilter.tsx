
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TestTypeFilterProps {
  testTypes: string[];
  selectedTypes: string[];
  onTypeChange: (type: string) => void;
}

const TestTypeFilter: React.FC<TestTypeFilterProps> = ({
  testTypes,
  selectedTypes,
  onTypeChange,
}) => {
  return (
    <div className="space-y-3">
      <Label>Assessment Types</Label>
      <div className="grid grid-cols-1 gap-2">
        {testTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${type}`}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => onTypeChange(type)}
            />
            <Label 
              htmlFor={`type-${type}`}
              className="text-sm"
            >
              {type}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestTypeFilter;
