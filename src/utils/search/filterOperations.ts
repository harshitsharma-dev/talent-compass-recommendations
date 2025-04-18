
import { Assessment } from '@/lib/mockData';
import { SearchFilters } from '@/types/search';

// Map of test type codes to descriptive names
const testTypeMap = {
  'K': 'Skills Assessment',
  'B': 'Behavioral Assessment',
  'T': 'Technical Assessment',
  'C': 'Cognitive Assessment',
  'P': 'Personality Test',
  'D': 'Domain Knowledge'
};

export const strictFilter = (assessments: Assessment[], filters: Partial<SearchFilters>): Assessment[] => {
  console.log(`Filtering ${assessments.length} assessments with filters:`, filters);
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.remote === true || 
    filters.adaptive === true || 
    (filters.maxDuration && filters.maxDuration < 180) ||
    (filters.testTypes && filters.testTypes.length > 0) ||
    (filters.requiredSkills && filters.requiredSkills.length > 0);

  if (!hasActiveFilters) {
    console.log('No active filters, returning all assessments');
    return assessments;
  }
  
  const filtered = assessments.filter(assessment => {
    // Convert assessment text to lowercase for case-insensitive comparison
    const assessmentText = `${assessment.title} ${assessment.description} ${assessment.test_type.join(' ')}`.toLowerCase();
    
    // Filter by duration if specified and less than default max
    if (filters.maxDuration && filters.maxDuration < 180 && assessment.assessment_length > filters.maxDuration) {
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
    if (filters.testTypes?.length) {
      // Convert single-letter test types to descriptive names for comparison
      const assessmentTestTypes = assessment.test_type.map(type => {
        return testTypeMap[type] || type;
      });
      
      console.log(`Assessment "${assessment.title}" test types: ${assessmentTestTypes.join(', ')}`);
      
      const matchesTestType = filters.testTypes.some(filterType => 
        assessmentTestTypes.some(assessmentType => {
          const filterLower = filterType.toLowerCase();
          const assessmentLower = assessmentType.toLowerCase();
          return assessmentLower.includes(filterLower) || filterLower.includes(assessmentLower);
        })
      );
      
      if (!matchesTestType) {
        console.log(`Assessment "${assessment.title}" filtered out: test type doesn't match any of [${filters.testTypes.join(', ')}]`);
        return false;
      }
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
