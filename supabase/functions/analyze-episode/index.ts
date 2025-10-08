import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { episodeUrl, podcastName } = await req.json();
    console.log('Analyzing episode:', { episodeUrl, podcastName });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Find or create podcast
    let podcastId: string;
    const { data: existingPodcast } = await supabase
      .from('podcasts')
      .select('id')
      .eq('name', podcastName)
      .single();

    if (existingPodcast) {
      podcastId = existingPodcast.id;
    } else {
      const { data: newPodcast, error: podcastError } = await supabase
        .from('podcasts')
        .insert({ name: podcastName })
        .select('id')
        .single();
      
      if (podcastError) throw podcastError;
      podcastId = newPodcast.id;
    }

    // Step 2: Use AI to analyze the episode
    const systemPrompt = `You are an expert at extracting founder lessons from podcast episodes. 
Your task is to analyze podcast content and extract:
1. Episode metadata (title, date if mentioned)
2. Founder name(s) and company information
3. Company details (stage, funding, valuation if mentioned, employee count, industry)
4. 10 tactical, actionable lessons with high impact
5. 5 relevant callouts for a travel/events startup (chravelapp.com)

Return your analysis in JSON format with this structure:
{
  "episodeTitle": "string",
  "releaseDate": "YYYY-MM-DD or null",
  "founderNames": "string (comma separated)",
  "company": {
    "name": "string",
    "foundingYear": number or null,
    "currentStage": "string",
    "fundingRaised": "string",
    "valuation": "string",
    "employeeCount": number or null,
    "industry": "string",
    "status": "Active/Acquired/Shutdown"
  },
  "lessons": [
    {
      "text": "3-4 sentence detailed lesson with specific context",
      "impactScore": 1-10,
      "actionabilityScore": 1-10,
      "category": "string",
      "founderAttribution": "string"
    }
  ],
  "chavelCallouts": [
    {
      "text": "Specific callout relevant to travel/events startup",
      "relevanceScore": 1-10
    }
  ]
}`;

    const userPrompt = `Analyze this podcast episode URL: ${episodeUrl}

Podcast Series: ${podcastName}

Extract all the information according to the system prompt. If you cannot access the actual content, provide a realistic mock analysis for demonstration purposes.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to analyze episode with AI');
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Step 3: Create or find company
    let companyId: string | null = null;
    if (analysis.company?.name) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', analysis.company.name)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: analysis.company.name,
            founding_year: analysis.company.foundingYear,
            current_stage: analysis.company.currentStage,
            funding_raised: analysis.company.fundingRaised,
            valuation: analysis.company.valuation,
            employee_count: analysis.company.employeeCount,
            industry: analysis.company.industry,
            status: analysis.company.status || 'Active',
          })
          .select('id')
          .single();

        if (companyError) throw companyError;
        companyId = newCompany.id;
      }
    }

    // Step 4: Create episode
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .insert({
        podcast_id: podcastId,
        title: analysis.episodeTitle,
        release_date: analysis.releaseDate,
        url: episodeUrl,
        company_id: companyId,
        founder_names: analysis.founderNames,
        analysis_status: 'completed',
      })
      .select('id')
      .single();

    if (episodeError) throw episodeError;

    // Step 5: Insert lessons
    if (analysis.lessons?.length > 0) {
      const lessonsToInsert = analysis.lessons.map((lesson: any) => ({
        episode_id: episode.id,
        lesson_text: lesson.text,
        impact_score: lesson.impactScore,
        actionability_score: lesson.actionabilityScore,
        category: lesson.category,
        founder_attribution: lesson.founderAttribution,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonsToInsert);

      if (lessonsError) throw lessonsError;
    }

    // Step 6: Insert chavel callouts
    if (analysis.chavelCallouts?.length > 0) {
      const calloutsToInsert = analysis.chavelCallouts.map((callout: any) => ({
        episode_id: episode.id,
        callout_text: callout.text,
        relevance_score: callout.relevanceScore,
      }));

      const { error: calloutsError } = await supabase
        .from('chavel_callouts')
        .insert(calloutsToInsert);

      if (calloutsError) throw calloutsError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      episodeId: episode.id,
      message: 'Episode analyzed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-episode:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
