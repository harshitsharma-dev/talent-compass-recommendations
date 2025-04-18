import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { parse } from 'https://deno.land/std@0.177.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const preprocessText = (text: string): string => {
  if (!text) return '';
  
  // First, handle commas and other punctuation carefully
  let processedText = text
    .toLowerCase()
    // Replace commas with spaces but keep meaningful punctuation
    .replace(/,/g, ' ')
    // Remove other special characters but keep meaningful ones
    .replace(/[^\w\s-_.]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
  
  // Handle common abbreviations and terms
  const synonymMap: {[key: string]: string} = {
    // Programming languages and technologies
    'js': 'javascript',
    'javascript': 'javascript programming coding web development frontend',
    'ts': 'typescript',
    'typescript': 'typescript programming coding microsoft',
    'py': 'python',
    'python': 'python programming coding data science machine learning',
    'sql': 'sql database query data analysis relational database',
    'java': 'java programming coding backend enterprise',
    'react': 'react javascript frontend web development user interface',
    'angular': 'angular typescript frontend web development google',
    'vue': 'vue javascript frontend web development',
    'node': 'node.js javascript backend server',
    'nodejs': 'node.js javascript backend server',
    // Added more synonyms for common terms
    'script': 'javascript js programming coding',
    'coding': 'programming development implementation',
    'assessment': 'test evaluation examination challenge',
    'professionals': 'experts skilled workers specialists',
    'mid-level': 'intermediate experienced mid-career',
    'proficient': 'skilled expert competent capable advanced',
    
    // Job roles and test types
    'dev': 'developer software engineer programmer coder',
    'developer': 'developer software engineer programmer coder',
    'cognitive': 'cognitive assessment logical thinking problem-solving intelligence',
    'personality': 'personality test behavior characteristics traits temperament',
    'soft skills': 'behavioral assessment communication teamwork interpersonal',
    'analytical': 'analytical data-driven logical methodical',
    
    // Additional terms for better matching
    'tech': 'technology technical programming coding computer software',
    'frontend': 'front-end ui user interface web browser client-side',
    'backend': 'back-end api server database server-side',
    'fullstack': 'full-stack frontend backend complete development',
    'qa': 'quality assurance testing test verification',
    'testing': 'test assessment evaluation examination challenge',
    'quick': 'short fast rapid brief speedy',
    'short': 'brief quick concise small minimal',
    'long': 'extensive detailed comprehensive thorough',
    'beginner': 'entry level junior novice starter learning',
    'expert': 'senior advanced experienced professional master',
  };
  
  // Replace all instances of synonyms with expanded forms
  Object.entries(synonymMap).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr.replace(/\+/g, '\\+')}\\b`, 'gi');
    processedText = processedText.replace(regex, expansion);
  });
  
  return processedText;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // Fetch CSV data
    console.log('Fetching CSV file...');
    const csvResponse = await fetch('https://raw.githubusercontent.com/your-repo/combined_catalog_with_links_enriched_final.csv');
    const csvText = await csvResponse.text();
    
    // Parse CSV
    console.log('Parsing CSV data...');
    const { rows } = await parse(csvText, {
      skipFirstRow: true,
      columns: ['Test Title', 'Link', 'Remote Testing', 'Adaptive/IRT', 'Test Type', 'Description', 'Job Levels', 'Languages', 'Assessment Length']
    });

    console.log(`Processing ${rows.length} assessments...`);

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(rows.length/batchSize)}`);
      
      for (const row of batch) {
        // Create rich text representation for embedding
        const textToEmbed = preprocessText(
          `${row['Test Title']} ${row['Description']} ` + 
          `Test types: ${row['Test Type']} ` + 
          `Job levels: ${row['Job Levels']} ` + 
          `Duration: ${row['Assessment Length']} minutes ` +
          `${row['Remote Testing'] === 'Yes' ? 'Remote testing supported' : ''} ` +
          `${row['Adaptive/IRT'] === 'Yes' ? 'Adaptive testing supported' : ''}`
        );

        try {
          // Generate embedding via OpenAI
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
          });

          if (!embeddingResponse.ok) {
            throw new Error(`OpenAI API error: ${await embeddingResponse.text()}`);
          }

          const { data } = await embeddingResponse.json();
          const embedding = data[0].embedding;

          // Store in database
          const { error: insertError } = await supabase
            .from('assessment_embeddings')
            .upsert({
              assessment_id: row['Link'],
              title: row['Test Title'],
              embedding
            });

          if (insertError) {
            throw new Error(`Error storing embedding: ${insertError.message}`);
          }

          console.log(`Successfully processed: ${row['Test Title']}`);
        } catch (error) {
          console.error(`Error processing assessment ${row['Test Title']}:`, error);
        }
      }

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < rows.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({ message: 'Embeddings generation complete' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
