
import { toast } from "sonner";

const SUPABASE_PROJECT_ID = "jflnwnguhoedlcdshtmt";
const API_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYW53bmd1aG9lZGxjZHNodG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMzQ4NDcsImV4cCI6MTk5NjYxMDg0N30.R-Kf-aBs0uJYO3Qyl3A94myQfTNnke5FaixtacWTBtI";

/**
 * Check the health of the API
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      },
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Recommendation request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.recommended_assessments || [];
  } catch (error) {
    console.error("Recommendation API error:", error);
    toast.error("Failed to get recommendations from API");
    return [];
  }
};
