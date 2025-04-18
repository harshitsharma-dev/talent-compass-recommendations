
import React from 'react';
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
        <h3 className="text-lg font-medium mb-4">Refine Results</h3>
      </div>

      <SupportFilter
        remote={remote}
        onRemoteChange={setRemote}
        adaptive={adaptive}
        onAdaptiveChange={setAdaptive}
      />

      <DurationFilter
        maxDuration={maxDuration}
        onDurationChange={setMaxDuration}
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
