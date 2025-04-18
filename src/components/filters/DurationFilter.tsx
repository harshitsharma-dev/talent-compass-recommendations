
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface DurationFilterProps {
  maxDuration: number;
  onDurationChange: (value: number) => void;
}

const DurationFilter: React.FC<DurationFilterProps> = ({
  maxDuration,
  onDurationChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Label htmlFor="duration">Max Duration (minutes)</Label>
        <span className="text-sm text-muted-foreground">{maxDuration}</span>
      </div>
      <Slider
        id="duration"
        min={15}
        max={180}
        step={15}
        value={[maxDuration]}
        onValueChange={(values) => onDurationChange(values[0])}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>15m</span>
        <span>3h</span>
      </div>
    </div>
  );
};

export default DurationFilter;
