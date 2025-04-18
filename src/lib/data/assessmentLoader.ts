
import { Assessment } from '../mockData';

// Simple CSV parser function
const parseCSV = (text: string): any[] => {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj: any, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
};

// Store the parsed CSV data
let parsedAssessments: Assessment[] = [];

// Function to load and parse the CSV file
export const loadAssessmentData = async (): Promise<Assessment[]> => {
  return new Promise((resolve, reject) => {
    if (parsedAssessments.length > 0) {
      console.log(`Using cached data with ${parsedAssessments.length} assessments`);
      resolve(parsedAssessments);
      return;
    }

    console.log('Fetching CSV data...');
    fetch('/combined_catalog_with_links_enriched_final.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load CSV file: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        console.log('CSV data fetched, parsing...');
        const results = parseCSV(csvText);
        console.log(`Parsed ${results.length} rows from CSV`);
        
        const assessmentData = results
          .filter(row => row.title && row.url)
          .map((row, index) => ({
            id: String(index),
            title: row.title || 'Untitled Assessment',
            url: row.url || '#',
            remote_support: row.remote_support === 'Yes' || row.remote_support === 'true',
            adaptive_support: row.adaptive_support === 'Yes' || row.adaptive_support === 'true',
            test_type: row.test_type ? row.test_type.split(',').map((t: string) => t.trim()) : ['Technical Assessment'],
            description: row.description || 'No description available',
            job_levels: row.job_levels ? row.job_levels.split(',').map((j: string) => j.trim()) : ['All Levels'],
            languages: row.languages ? row.languages.split(',').map((l: string) => l.trim()) : ['English'],
            assessment_length: parseInt(row.assessment_length) || 45,
            downloads: parseInt(row.downloads) || 0
          }));

        console.log(`Created ${assessmentData.length} assessment objects`);
        parsedAssessments = assessmentData;
        resolve(assessmentData);
      })
      .catch(error => {
        console.error('Error loading CSV file:', error);
        reject(error);
      });
  });
};
