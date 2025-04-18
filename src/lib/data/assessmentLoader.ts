
import Papa from 'papaparse';
import { Assessment } from '../mockData';

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
        console.log('CSV data fetched, parsing with PapaParse...');
        
        // Parse CSV using PapaParse with improved configuration
        const results = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          // Add delimiter detection to handle commas in fields
          delimitersToGuess: [',', ';', '\t', '|'],
          // More robust quoting handling
          quoteChar: '"',
        });
        
        console.log(`Parsed ${results.data.length} rows from CSV`);
        
        // Debug the first few rows to see what we're getting
        if (results.data.length > 0) {
          console.log('CSV Headers:', results.meta.fields);
          console.log('First row sample:', results.data[0]);
        }
        
        const assessmentData = results.data
          .filter((row: any) => row['Test Title'] && row['Link'])
          .map((row: any, index: number) => {
            // Create a more robust assessment object
            const assessment = {
              id: String(index),
              title: row['Test Title'] || 'Untitled Assessment',
              url: row['Link'] ? `https://www.shl.com${row['Link']}` : '#',
              remote_support: row['Remote Testing'] === 'Yes',
              adaptive_support: row['Adaptive/IRT'] === 'Yes',
              test_type: row['Test Type'] ? [row['Test Type']] : ['Technical Assessment'],
              description: row['Description'] || 'No description available',
              job_levels: row['Job Levels'] ? row['Job Levels'].split(',').map((j: string) => j.trim()) : ['All Levels'],
              languages: row['Languages'] ? row['Languages'].split(',').map((l: string) => l.trim()) : ['English'],
              assessment_length: parseInt(row['Assessment Length']) || 45,
              downloads: Math.floor(Math.random() * 5000) + 100 // Random download count since it's not in CSV
            };

            // Log any problematic rows for debugging
            if (!assessment.title || !assessment.url.includes('shl.com')) {
              console.log('Potentially problematic row:', row);
            }

            return assessment;
          });

        console.log(`Created ${assessmentData.length} assessment objects`);
        
        // Filter out any obviously invalid entries
        const validAssessments = assessmentData.filter(assessment => 
          assessment.title && assessment.title !== 'undefined' && 
          assessment.url && assessment.url !== 'https://www.shl.com#'
        );
        
        console.log(`After validation: ${validAssessments.length} assessment objects`);
        parsedAssessments = validAssessments;
        resolve(validAssessments);
      })
      .catch(error => {
        console.error('Error loading or parsing CSV file:', error);
        reject(error);
      });
  });
};
