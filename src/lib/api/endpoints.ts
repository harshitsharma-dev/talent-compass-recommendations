
import { toast } from "sonner";

const SUPABASE_PROJECT_ID = "jflnwnguhoedlcdshtmt";
const API_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYW53bmd1aG9lZGxjZHNodG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMzQ4NDcsImV4cCI6MTk5NjYxMDg0N30.R-Kf-aBs0uJYO3Qyl3A94myQfTNnke5FaixtacWTBtI";

/**
 * Check the health of the API
 */
export const checkApiHealth = async (): Promise<{ status: string; timestamp: string } | null> => {
  try {
    console.log(`Checking API health at: ${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      credentials: 'omit',
    });
    
    console.log(`Health check response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log(`Health check response content type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Health check did not return JSON content type');
    }
    
    const responseData = await response.json();
    console.log('Health check response:', responseData);
    
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid health check response format');
    }
    
    return {
      status: responseData.status || 'unknown',
      timestamp: responseData.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error("API Health check error:", error);
    return null;
  }
};

/**
 * Get assessment recommendations based on query
 */
export const getRecommendations = async (query: string): Promise<any> => {
  try {
    console.log(`Fetching recommendations for query: "${query}"`);
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query }),
      cache: 'no-store',
      credentials: 'omit',
    });

    console.log(`Recommendations API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Recommendation request failed with status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Recommendations endpoint did not return JSON content type');
      throw new Error('Invalid content type returned from API');
    }
    
    const data = await response.json();
    console.log(`Received API response:`, data);
    console.log(`Received ${data.recommended_assessments?.length || 0} recommendations`);
    
    if (!data || !data.recommended_assessments) {
      console.warn('Recommendations response missing expected data structure');
      return [];
    }

    // Validate and ensure each assessment has required fields
    const validAssessments = (data.recommended_assessments || []).filter(assessment => {
      return assessment && typeof assessment === 'object';
    }).map(assessment => {
      // Ensure crucial fields have defaults
      return {
        ...assessment,
        id: assessment.id || Math.random().toString(36).substr(2, 9),
        title: assessment.title || 'Untitled Assessment',
        description: assessment.description || 'No description available',
        test_type: Array.isArray(assessment.test_type) ? assessment.test_type : ['Technical Assessment'],
        assessment_length: assessment.assessment_length || assessment.duration || 45,
        remote_support: !!assessment.remote_support,
        adaptive_support: !!assessment.adaptive_support
      };
    });

    console.log(`Returning ${validAssessments.length} validated assessments`);
    return validAssessments;
  } catch (error) {
    console.error("Recommendation API error:", error);
    toast.error("Failed to get recommendations from API");
    return [];
  }
};
