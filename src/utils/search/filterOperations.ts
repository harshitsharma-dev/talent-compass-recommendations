
import { Assessment } from '@/lib/mockData';
import { SearchFilters } from '@/types/search';

export const strictFilter = (assessments: Assessment[], filters: Partial<SearchFilters>): Assessment[] => {
  console.log(`Filtering ${assessments.length} assessments with filters:`, filters);
  
  const filtered = assessments.filter(assessment => {
    // Debug individual assessment
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    // Filter by duration if specified
    if (filters.maxDuration && assessment.assessment_length > filters.maxDuration) {
      console.log(`Assessment "${assessment.title}" filtered out: duration ${assessment.assessment_length} > ${filters.maxDuration}`);
      return false;
    }
    
    // Filter by remote support if required
    if (filters.remote === true && !assessment.remote_support) {
      console.log(`Assessment "${assessment.title}" filtered out: remote support required but not available`);
      return false;
    }
    
    // Filter by adaptive support if required
    if (filters.adaptive === true && !assessment.adaptive_support) {
      console.log(`Assessment "${assessment.title}" filtered out: adaptive support required but not available`);
      return false;
    }
    
    // Filter by test types if specified
    if (filters.testTypes?.length && !filters.testTypes.some(type => 
      assessment.test_type.some(t => t.toLowerCase().includes(type.toLowerCase()))
    )) {
      console.log(`Assessment "${assessment.title}" filtered out: test type doesn't match any of [${filters.testTypes.join(', ')}]`);
      return false;
    }
    
    // Filter by required skills if specified
    if (filters.requiredSkills?.length) {
      const hasRequiredSkill = filters.requiredSkills.some(skill => 
        assessmentText.includes(skill.toLowerCase())
      );
      
      if (!hasRequiredSkill) {
        console.log(`Assessment "${assessment.title}" filtered out: doesn't match any required skills`);
        return false;
      }
    }
    
    // Assessment passed all filters
    console.log(`Assessment "${assessment.title}" passed all filters`);
    return true;
  });
  
  console.log(`Filtering complete: ${filtered.length} assessments passed the filters`);
  return filtered;
};
