
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Globe, BarChart3, ExternalLink } from 'lucide-react';
import { Assessment } from '@/lib/mockData';

interface AssessmentCardProps {
  assessment: Assessment;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col animate-fade-in-up">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl">{assessment.title}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {assessment.test_type.map((type, index) => (
            <Badge key={index} variant="secondary" className="font-normal">
              {type}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-muted-foreground mb-4">
          {assessment.description}
        </p>
        
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-muted-foreground" />
            <span>{assessment.assessment_length} minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={16} className="text-muted-foreground" />
            <span>{assessment.remote_support ? 'Remote' : 'In-person'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={16} className="text-muted-foreground" />
            <span>{assessment.adaptive_support ? 'Adaptive' : 'Fixed'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Languages:</span>
            <span>{assessment.languages.join(', ')}</span>
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
