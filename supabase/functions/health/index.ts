
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )
  }

  try {
    console.log("Health check endpoint called")
    
    const healthStatus = {
      service_name: "talent-compass-recommendations",
      status: "healthy",
      api_version: "1.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/health",
        recommend: "/recommend"
      }
    }

    return new Response(
      JSON.stringify(healthStatus),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Health check error:", error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "error",
        service_name: "talent-compass-recommendations"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
