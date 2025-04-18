
import { Assessment } from '@/lib/mockData';
import { SearchFilters } from '@/types/search';

export const strictFilter = (assessments: Assessment[], filters: Partial<SearchFilters>): Assessment[] => {
  return assessments.filter(assessment => {
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    // Filter by duration if specified
    if (filters.maxDuration && assessment.assessment_length > filters.maxDuration) {
      return false;
    }
    
    // Filter by remote support if required
    if (filters.remote === true && !assessment.remote_support) {
      return false;
    }
    
    // Filter by adaptive support if required
    if (filters.adaptive === true && !assessment.adaptive_support) {
      return false;
    }
    
    // Filter by test types if specified
    if (filters.testTypes?.length && !filters.testTypes.some(type => 
      assessment.test_type.some(t => t.toLowerCase().includes(type.toLowerCase()))
    )) {
      return false;
    }
    
    // Filter by required skills if specified
    if (filters.requiredSkills?.length) {
      const hasRequiredSkill = filters.requiredSkills.some(skill => 
        assessmentText.includes(skill.toLowerCase())
      );
      
      if (!hasRequiredSkill) {
        return false;
      }
    }
    
    return true;
  });
};
