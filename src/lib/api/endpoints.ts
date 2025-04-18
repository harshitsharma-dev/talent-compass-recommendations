
import { toast } from "sonner";

const SUPABASE_PROJECT_ID = "jflnwnguhoedlcdshtmt";
const API_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

/**
 * Check the health of the API
 */
export const checkApiHealth = async (): Promise<{ status: string; timestamp: string } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
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
