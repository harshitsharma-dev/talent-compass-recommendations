
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface FilterOptionsProps {
  remote: boolean;
  setRemote: (value: boolean) => void;
  adaptive: boolean;
  setAdaptive: (value: boolean) => void;
  maxDuration: number;
  setMaxDuration: (value: number) => void;
  testTypes: string[];
  setTestTypes: (value: string[]) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
  remote,
  setRemote,
  adaptive,
  setAdaptive,
  maxDuration,
  setMaxDuration,
  testTypes,
  setTestTypes,
}) => {
  const availableTestTypes = [
    "Coding", 
    "Technical Knowledge", 
    "Design", 
    "Case Study", 
    "Personality", 
    "Scenario-Based",
    "Problem Solving",
    "Role Play"
  ];

  const handleTestTypeChange = (type: string) => {
    if (testTypes.includes(type)) {
      setTestTypes(testTypes.filter(t => t !== type));
    } else {
      setTestTypes([...testTypes, type]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Filter Options</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remote" 
            checked={remote} 
            onCheckedChange={() => setRemote(!remote)}
          />
          <Label htmlFor="remote">Remote Testing Only</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="adaptive" 
            checked={adaptive} 
            onCheckedChange={() => setAdaptive(!adaptive)}
          />
          <Label htmlFor="adaptive">Adaptive Testing Only</Label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="duration">Max Duration (minutes)</Label>
          <span className="text-sm text-muted-foreground">{maxDuration}</span>
        </div>
        <Slider
          id="duration"
          min={15}
          max={120}
          step={5}
          value={[maxDuration]}
          onValueChange={(values) => setMaxDuration(values[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>15m</span>
          <span>120m</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Assessment Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {availableTestTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={testTypes.includes(type)}
                onCheckedChange={() => handleTestTypeChange(type)}
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
    </div>
  );
};

export default FilterOptions;
