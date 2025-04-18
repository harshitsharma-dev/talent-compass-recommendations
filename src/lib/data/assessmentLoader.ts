
import Papa from 'papaparse';
import { Assessment } from '../mockData';

// Define an interface for CSV row data
interface CSVRowData {
  [key: string]: string;  // CSV rows have string keys and string values
}

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

    console.log('Fetching CSV data from output with embeddings...');
    fetch('/output_with_embeddings.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load CSV file: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        console.log('CSV data fetched, parsing with PapaParse...');
        
        // Parse CSV using PapaParse with improved configuration
        const results = Papa.parse<CSVRowData>(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          delimitersToGuess: [',', ';', '\t', '|'],
          quoteChar: '"',
        });
        
        console.log(`Parsed ${results.data.length} rows from CSV`);
        
        // Debug the first few rows to see what we're getting
        if (results.data.length > 0) {
          console.log('CSV Headers:', results.meta.fields);
          console.log('First row sample:', results.data[0]);
          // Now this is type-safe
          console.log('Embedding sample:', results.data[0]?.embedding);
        }
        
        const assessmentData = results.data
          .filter((row) => row['Test Title'] && row['Link'] && row['embedding'])
          .map((row, index: number) => {
            // Parse the embedding string into an array
            let embedding;
            try {
              embedding = JSON.parse(row['embedding'].replace(/'/g, '"'));
              if (!Array.isArray(embedding)) {
                console.warn(`Invalid embedding format for assessment ${index}`);
                embedding = null;
              }
            } catch (e) {
              console.warn(`Failed to parse embedding for assessment ${index}:`, e);
              embedding = null;
            }

            return {
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
              downloads: Math.floor(Math.random() * 5000) + 100,
              embedding: embedding
            };
          });

        console.log(`Created ${assessmentData.length} assessment objects`);
        
        const validAssessments = assessmentData.filter(assessment => 
          assessment.title && 
          assessment.title !== 'undefined' && 
          assessment.url && 
          assessment.url !== 'https://www.shl.com#' &&
          assessment.embedding !== null
        );
        
        console.log(`After validation: ${validAssessments.length} assessment objects with valid embeddings`);
        parsedAssessments = validAssessments;
        resolve(validAssessments);
      })
      .catch(error => {
        console.error('Error loading or parsing CSV file:', error);
        reject(error);
      });
  });
};
