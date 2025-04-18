
import React, { useEffect } from 'react';
import TestTypeFilter from './filters/TestTypeFilter';
import DurationFilter from './filters/DurationFilter';
import SupportFilter from './filters/SupportFilter';

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
    "Technical Assessment",
    "Coding Challenge",
    "Behavioral Assessment",
    "Skills Assessment",
    "Personality Test",
    "Cognitive Assessment",
    "Problem Solving",
    "Domain Knowledge"
  ];

  // Debug props on mount and changes
  useEffect(() => {
    console.log('FilterOptions rendered with:', { remote, adaptive, maxDuration, testTypes });
  }, [remote, adaptive, maxDuration, testTypes]);

  // Debugging when component mounts and unmounts to help diagnose visibility issues
  useEffect(() => {
    console.log('FilterOptions component mounted');
    
    return () => {
      console.log('FilterOptions component unmounted');
    };
  }, []);

  const handleTestTypeChange = (type: string) => {
    console.log(`Test type ${type} clicked. Current selection:`, testTypes);
    if (testTypes.includes(type)) {
      const newTypes = testTypes.filter(t => t !== type);
      console.log(`Removing ${type}, new selection:`, newTypes);
      setTestTypes(newTypes);
    } else {
      const newTypes = [...testTypes, type];
      console.log(`Adding ${type}, new selection:`, newTypes);
      setTestTypes(newTypes);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Refine Results</h3>
      </div>

      <SupportFilter
        remote={remote}
        onRemoteChange={(value) => {
          console.log(`Remote changed to: ${value}`);
          setRemote(value);
        }}
        adaptive={adaptive}
        onAdaptiveChange={(value) => {
          console.log(`Adaptive changed to: ${value}`);
          setAdaptive(value);
        }}
      />

      <DurationFilter
        maxDuration={maxDuration}
        onDurationChange={(value) => {
          console.log(`Duration changed to: ${value}`);
          setMaxDuration(value);
        }}
      />

      <TestTypeFilter
        testTypes={availableTestTypes}
        selectedTypes={testTypes}
        onTypeChange={handleTestTypeChange}
      />
    </div>
  );
};

export default FilterOptions;
