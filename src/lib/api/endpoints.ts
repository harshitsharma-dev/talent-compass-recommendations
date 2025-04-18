
import { toast } from "sonner";

const SUPABASE_PROJECT_ID = "jflnwnguhoedlcdshtmt";
const API_BASE_URL = `https://talent-compass-recommendations.lovable.app`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYW53bmd1aG9lZGxjZHNodG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMzQ4NDcsImV4cCI6MTk5NjYxMDg0N30.R-Kf-aBs0uJYO3Qyl3A94myQfTNnke5FaixtacWTBtI";

/**
 * Check the health of the API
 */
export const checkApiHealth = async (): Promise<{ status: string; timestamp: string } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      }
    });
    
    if (!response.ok) {
      console.error(`Health check failed with status: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Health check response is not JSON:', contentType);
      return { status: 'unknown', timestamp: new Date().toISOString() };
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Health check error:", error);
    // Return a fallback status to prevent UI from flickering
    return { status: 'unknown', timestamp: new Date().toISOString() };
  }
};

/**
 * Get assessment recommendations based on query
 */
export const getRecommendations = async (query: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error(`Recommendation request failed with status: ${response.status}`);
      toast.error("Failed to get recommendations. Please try again.");
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Recommendation response is not JSON:', contentType);
      toast.error("Received invalid response format");
      return [];
    }

    const data = await response.json();
    return data.recommended_assessments || [];
  } catch (error) {
    console.error("Recommendation API error:", error);
    toast.error("Failed to get recommendations from API");
    return [];
  }
};
