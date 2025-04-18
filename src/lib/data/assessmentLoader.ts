
import Papa from 'papaparse';
import { Assessment } from '../mockData';
import { supabase } from '@/integrations/supabase/client';

interface CSVRowData {
  [key: string]: string;
}

// Store the parsed CSV data
let parsedAssessments: Assessment[] = [];

// Function to load and parse the CSV file
export const loadAssessmentData = async (): Promise<Assessment[]> => {
  if (parsedAssessments.length > 0) {
    console.log(`Using cached data with ${parsedAssessments.length} assessments`);
    return parsedAssessments;
  }

  try {
    console.log('Fetching assessment data from Supabase');
    
    // First, fetch assessments from the SHL table
    const { data: shlData, error: shlError } = await supabase
      .from('SHL')
      .select('*');

    if (shlError) {
      console.error('Error fetching SHL data:', shlError);
      throw shlError;
    }

    // Then, fetch embeddings from assessment_embeddings table
    const { data: embeddingsData, error: embeddingsError } = await supabase
      .from('assessment_embeddings')
      .select('*');

    if (embeddingsError) {
      console.error('Error fetching embeddings:', embeddingsError);
      throw embeddingsError;
    }

    // Create a mapping of assessment_id to embedding
    const embeddingsMap = embeddingsData.reduce((acc, embedding) => {
      acc[embedding.assessment_id] = embedding.embedding;
      return acc;
    }, {});

    const assessmentData = shlData
      .filter((row) => row['Test Title'] && row['Link'])
      .map((row, index: number) => {
        const assessmentId = `${index}`;
        const embedding = embeddingsMap[assessmentId] || null;

        return {
          id: assessmentId,
          title: row['Test Title'] || 'Untitled Assessment',
          url: row['Link'] ? `https://www.shl.com${row['Link']}` : '#',
          remote_support: row['Remote Testing'] === 'Yes',
          adaptive_support: row['Adaptive/IRT'] === 'Yes',
          test_type: row['Test Type'] ? [row['Test Type']] : ['Technical Assessment'],
          description: row['Description'] || 'No description available',
          job_levels: row['Job Levels'] ? row['Job Levels'].split(',').map((j: string) => j.trim()) : ['All Levels'],
          languages: row['Languages'] ? row['Languages'].split(',').map((l: string) => l.trim()) : ['English'],
          assessment_length: parseInt(row['Assessment Length']) || 45,
          downloads: Math.floor(Math.random() * 5000) + 100,
          embedding: embedding
        };
      });

    const validAssessments = assessmentData.filter(assessment => 
      assessment.title && 
      assessment.title !== 'undefined' && 
      assessment.url && 
      assessment.url !== 'https://www.shl.com#' &&
      assessment.embedding !== null
    );

    console.log(`After validation: ${validAssessments.length} assessment objects with embeddings`);
    parsedAssessments = validAssessments;
    return validAssessments;
  } catch (error) {
    console.error('Error loading assessment data:', error);
    return [];
  }
};
