
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log("Responding to OPTIONS request with CORS headers")
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log("Recommend endpoint called")
    
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { query } = await req.json()

    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string')
    }

    console.log('Processing recommendation request for query:', query)

    // Fetch assessments from the database
    const { data: assessments, error } = await supabase
      .from('SHL')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Transform the assessments to match the expected response format
    const recommendedAssessments = assessments.map(assessment => ({
      id: assessment.id || Math.random().toString(36).substr(2, 9),
      title: assessment["Test Title"] || "Assessment",
      url: `https://www.shl.com${assessment.Link}`,
      adaptive_support: assessment['Adaptive/IRT'] === 'Yes',
      description: assessment.Description || 'No description available',
      assessment_length: parseInt(assessment['Assessment Length']) || 45,
      duration: parseInt(assessment['Assessment Length']) || 45,
      remote_support: assessment['Remote Testing'] === 'Yes',
      test_type: assessment['Test Type'] ? [assessment['Test Type']] : ['Technical Assessment']
    }))

    console.log(`Found ${recommendedAssessments.length} recommendations`)

    return new Response(
      JSON.stringify({ 
        recommended_assessments: recommendedAssessments,
        count: recommendedAssessments.length,
        status: 'success'
      }),
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
    console.error('Error in recommend function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        recommended_assessments: [],
        count: 0,
        status: 'error'
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
