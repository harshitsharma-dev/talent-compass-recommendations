
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ExampleCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const ExampleCard: React.FC<ExampleCardProps> = ({ title, description, onClick }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
          {description}
        </p>
        <Button 
          variant="outline" 
          onClick={onClick}
          className="w-full justify-between group"
        >
          Use this example
          <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExampleCard;
