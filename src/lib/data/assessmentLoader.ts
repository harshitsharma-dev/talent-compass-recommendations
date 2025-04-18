
import { Assessment } from '../mockData';
import { supabase } from '@/integrations/supabase/client';

// Store the parsed data
let parsedAssessments: Assessment[] = [];

// Function to load and parse assessment data
export const loadAssessmentData = async (): Promise<Assessment[]> => {
  if (parsedAssessments.length > 0) {
    console.log(`Using cached data with ${parsedAssessments.length} assessments`);
    return parsedAssessments;
  }

  try {
    console.log('Fetching assessment data from Supabase');
    
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*');

    if (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }

    const validAssessments = assessments
      .filter(row => row.title && row.link)
      .map((row) => ({
        id: row.id.toString(),
        title: row.title || 'Untitled Assessment',
        url: row.link ? `https://www.shl.com${row.link}` : '#',
        remote_support: row.remote_support || false,
        adaptive_support: row.adaptive_support || false,
        test_type: row.test_type ? [row.test_type] : ['Technical Assessment'],
        description: row.description || 'No description available',
        job_levels: row.job_levels ? row.job_levels.split(',').map((j: string) => j.trim()) : ['All Levels'],
        languages: row.languages ? row.languages.split(',').map((l: string) => l.trim()) : ['English'],
        assessment_length: row.assessment_length || 45,
        downloads: row.downloads || Math.floor(Math.random() * 5000) + 100,
        embedding: row.embedding
      }));

    console.log(`Found ${validAssessments.length} valid assessments`);
    parsedAssessments = validAssessments;
    return validAssessments;
  } catch (error) {
    console.error('Error loading assessment data:', error);
    return [];
  }
};
