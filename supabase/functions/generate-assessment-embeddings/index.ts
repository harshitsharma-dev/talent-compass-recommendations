
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { preprocessText } from '../../../src/lib/search/textProcessing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all assessments from SHL table
    const { data: assessments, error: fetchError } = await supabase
      .from('SHL')
      .select('*')

    if (fetchError) {
      throw new Error(`Error fetching assessments: ${fetchError.message}`)
    }

    console.log(`Processing ${assessments.length} assessments...`)

    // Process assessments in batches to avoid rate limits
    const batchSize = 10
    const batches = []
    
    for (let i = 0; i < assessments.length; i += batchSize) {
      batches.push(assessments.slice(i, i + batchSize))
    }

    console.log(`Split into ${batches.length} batches of ${batchSize}`)

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length}`)
      
      const embeddingPromises = batch.map(async (assessment) => {
        // Create rich text representation for embedding
        const textToEmbed = preprocessText(
          `${assessment['Test Title']} ${assessment['Description']} ` + 
          `Test types: ${assessment['Test Type']} ` + 
          `Job levels: ${assessment['Job Levels']} ` + 
          `Duration: ${assessment['Assessment Length']} minutes ` +
          `${assessment['Remote Testing'] === 'Yes' ? 'Remote testing supported' : ''} ` +
          `${assessment['Adaptive/IRT'] === 'Yes' ? 'Adaptive testing supported' : ''}`
        )

        try {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: textToEmbed,
              model: 'text-embedding-ada-002'
            })
          })

          if (!embeddingResponse.ok) {
            throw new Error(`OpenAI API error: ${await embeddingResponse.text()}`)
          }

          const { data } = await embeddingResponse.json()
          const embedding = data[0].embedding

          // Store in database
          const { error: insertError } = await supabase
            .from('assessment_embeddings')
            .upsert({
              assessment_id: assessment['Link'], // Using Link as unique identifier
              title: assessment['Test Title'],
              embedding
            })

          if (insertError) {
            throw new Error(`Error storing embedding: ${insertError.message}`)
          }

          return true
        } catch (error) {
          console.error(`Error processing assessment ${assessment['Test Title']}:`, error)
          return false
        }
      })

      // Wait for batch to complete
      const results = await Promise.all(embeddingPromises)
      const successCount = results.filter(Boolean).length
      console.log(`Batch ${batchIndex + 1} complete: ${successCount}/${batch.length} successful`)
      
      // Add a small delay between batches to avoid rate limits
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return new Response(
      JSON.stringify({ message: 'Embeddings generation complete' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
