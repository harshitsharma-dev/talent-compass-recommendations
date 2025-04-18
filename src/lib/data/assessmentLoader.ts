
import { Assessment } from '../mockData';

// Simple CSV parser function
const parseCSV = (text: string): any[] => {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      // Handle quoted values with commas properly
      const values = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      // Create object from headers and values
      return headers.reduce((obj: any, header, index) => {
        const value = values[index] || '';
        // Remove quotes from the beginning and end if they exist
        obj[header] = value.replace(/^"|"$/g, '');
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
        
        // Debug the first few rows to see what we're getting
        if (results.length > 0) {
          console.log('First row sample:', results[0]);
        }
        
        const assessmentData = results
          .filter(row => row['Test Title'] && row.Link) // Use correct field names
          .map((row, index) => ({
            id: String(index),
            title: row['Test Title'] || 'Untitled Assessment',
            url: row.Link ? `https://www.shl.com${row.Link}` : '#',
            remote_support: row['Remote Testing'] === 'Yes',
            adaptive_support: row['Adaptive/IRT'] === 'Yes',
            test_type: row['Test Type'] ? [row['Test Type']] : ['Technical Assessment'],
            description: row.Description || 'No description available',
            job_levels: row['Job Levels'] ? row['Job Levels'].split(',').map((j: string) => j.trim()) : ['All Levels'],
            languages: row.Languages ? row.Languages.split(',').map((l: string) => l.trim()) : ['English'],
            assessment_length: parseInt(row['Assessment Length']) || 45,
            downloads: Math.floor(Math.random() * 5000) + 100 // Random download count since it's not in CSV
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
