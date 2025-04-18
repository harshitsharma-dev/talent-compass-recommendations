
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

    if (!assessments || assessments.length === 0) {
      console.warn('No assessments found in the database');
      return [];
    }

    const validAssessments = assessments
      .filter(row => row["Test Title"] && row.Link)
      .map((row) => ({
        id: row.id?.toString() || Math.random().toString(),
        title: row["Test Title"] || 'Untitled Assessment',
        url: row.Link ? `https://www.shl.com${row.Link}` : '#',
        remote_support: row["Remote Testing"]?.toLowerCase() === 'yes',
        adaptive_support: row["Adaptive/IRT"]?.toLowerCase() === 'yes',
        test_type: row["Test Type"] ? [row["Test Type"]] : ['Technical Assessment'],
        description: row.Description || 'No description available',
        job_levels: row["Job Levels"] ? String(row["Job Levels"]).split(',').map(j => j.trim()) : ['All Levels'],
        languages: row.Languages ? String(row.Languages).split(',').map(l => l.trim()) : ['English'],
        assessment_length: parseInt(row["Assessment Length"]) || 45,
        downloads: parseInt(row.Downloads) || Math.floor(Math.random() * 5000) + 100,
        embedding: row.embedding ? row.embedding : null
      }));

    console.log(`Found ${validAssessments.length} valid assessments`);
    parsedAssessments = validAssessments;
    return validAssessments;
  } catch (error) {
    console.error('Error loading assessment data:', error);
    return [];
  }
};
