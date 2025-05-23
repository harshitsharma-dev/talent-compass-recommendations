
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Globe, BarChart3, ExternalLink, Download, Layers } from 'lucide-react';
import { Assessment } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface AssessmentCardProps {
  assessment: Assessment;
  className?: string;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment, className }) => {
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col animate-fade-in-up", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl">{assessment.title}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {assessment.test_type && assessment.test_type.map((type, index) => (
            <Badge key={index} variant="secondary" className="font-normal">
              {type}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {assessment.description}
        </p>
        
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-muted-foreground" />
            <span>{assessment.assessment_length || assessment.duration || 45} minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={16} className="text-muted-foreground" />
            <span>{assessment.remote_support ? 'Remote Support' : 'In-person Only'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={16} className="text-muted-foreground" />
            <span>{assessment.adaptive_support ? 'Adaptive' : 'Fixed'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers size={16} className="text-muted-foreground" />
            <span>{assessment.job_levels && Array.isArray(assessment.job_levels) 
              ? assessment.job_levels.join(', ') 
              : 'All Levels'}</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <Download size={16} className="text-muted-foreground" />
            <span>{assessment.downloads ? assessment.downloads.toLocaleString() : '0'} downloads</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button asChild className="w-full gap-2 justify-center">
          <a href={assessment.url} target="_blank" rel="noopener noreferrer">
            View Assessment
            <ExternalLink size={16} />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssessmentCard;
