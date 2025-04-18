
import { toast } from "sonner";

const SUPABASE_PROJECT_ID = "jflnwnguhoedlcdshtmt";
const API_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbG53bmd1aG9lZGxjZHNodG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMzQ4NDcsImV4cCI6MTk5NjYxMDg0N30.R-Kf-aBs0uJYO3Qyl3A94myQfTNnke5FaixtacWTBtI";

/**
 * Check the health of the API
 */
export const checkApiHealth = async (): Promise<{ status: string; timestamp: string } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      }
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
  console.log("Calling recommendation API with query:", query);
  
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
      const errorText = await response.text();
      console.error(`Recommendation API error (${response.status}):`, errorText);
      throw new Error(`Recommendation request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Recommendation API response:", data);
    
    // Process embedding data if present
    if (data.recommended_assessments && Array.isArray(data.recommended_assessments)) {
      const assessments = data.recommended_assessments.map(assessment => {
        // Ensure embedding is properly formatted if included
        if (assessment.embedding) {
          try {
            // Handle different embedding formats
            if (typeof assessment.embedding === 'string') {
              assessment.embedding = JSON.parse(assessment.embedding.replace(/'/g, '"'));
            }
          } catch (err) {
            console.warn("Failed to parse embedding:", err);
          }
        }
        return assessment;
      });
      
      console.log(`Successfully processed ${assessments.length} recommended assessments with embeddings`);
      return assessments;
    }
    
    console.warn("Recommendation API returned invalid data structure:", data);
    return [];
  } catch (error) {
    console.error("Recommendation API error:", error);
    toast.error("Failed to get recommendations from API");
    return [];
  }
};
