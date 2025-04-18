
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  console.log("Health check endpoint called with method:", req.method);
  
  // Handle CORS pre-flight request
  if (req.method === 'OPTIONS') {
    console.log("Responding to OPTIONS request with CORS headers");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    console.log("Processing health check request");
    
    const response = {
      status: "healthy",
      timestamp: new Date().toISOString()
    }

    console.log("Sending health check response:", response);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Health check error:", error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "error",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        },
        status: 500
      }
    )
  }
})
