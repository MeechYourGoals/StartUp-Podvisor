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
    const { episodeUrl, podcastName, startupProfile } = await req.json();
    console.log('Analyzing episode:', { episodeUrl, podcastName, hasProfile: !!startupProfile });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!episodeUrl) {
      throw new Error('Episode URL is required');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract video ID for YouTube URLs
    let videoId = '';
    let videoTitle = '';
    if (episodeUrl.includes('youtube.com') || episodeUrl.includes('youtu.be')) {
      const urlParams = new URLSearchParams(new URL(episodeUrl).search);
      videoId = urlParams.get('v') || episodeUrl.split('/').pop()?.split('?')[0] || '';
      
      // Fetch YouTube video metadata
      try {
        const ytResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(episodeUrl)}&format=json`);
        if (ytResponse.ok) {
          const ytData = await ytResponse.json();
          videoTitle = ytData.title || '';
        }
      } catch (e) {
        console.log('Could not fetch YouTube metadata:', e);
      }
    }

    // Step 2: Use AI to analyze the episode with tool calling
    const systemPrompt = `You are an expert at extracting founder lessons from podcast episodes. 
Your task is to deeply analyze podcast content and extract comprehensive, actionable insights.

CRITICAL REQUIREMENTS:
- Extract EXACTLY 10 tactical lessons ranked by actionability and impact (each 3-4 sentences with specific context)
- Extract EXACTLY 5 callouts relevant to a travel/events startup (chravelapp.com)
- Research and include actual company data (funding, valuation, stage, employee count)
- Cite specific examples and stories from the founder
- If data is unavailable, mark as "Unknown" or "Not disclosed"
- DO NOT provide mock or placeholder data
- Extract the podcast series name from the episode context if not provided`;

    const userPrompt = `Analyze this podcast episode:
URL: ${episodeUrl}
${videoTitle ? `Title: ${videoTitle}` : ''}
${podcastName ? `Podcast Series: ${podcastName}` : 'Podcast Series: Please extract from the episode'}

INSTRUCTIONS:
1. Watch/listen to the episode and extract real insights from the actual content
2. Identify the founder(s) and their company
3. Research the company's current metrics (funding, valuation, stage, employees, industry)
4. Extract EXACTLY 10 tactical, actionable lessons with specific context from the founder's stories
5. Extract EXACTLY 5 callouts specifically relevant to chravelapp.com (a travel/events startup)
6. Rank lessons by actionability (1-10) and impact (1-10)
7. Include founder attribution for each lesson
8. If you cannot access the content, return an error - do NOT provide mock data`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "extract_episode_data",
              description: "Extract structured data from podcast episode",
              parameters: {
                type: "object",
                properties: {
                  podcastSeriesName: { type: "string", description: "Name of the podcast series" },
                  episodeTitle: { type: "string", description: "Episode title" },
                  releaseDate: { type: "string", description: "Release date in YYYY-MM-DD format", nullable: true },
                  founderNames: { type: "string", description: "Comma-separated founder names" },
                  company: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      foundingYear: { type: "number", nullable: true },
                      currentStage: { type: "string", description: "e.g., Seed, Series A, Public, Acquired" },
                      fundingRaised: { type: "string", description: "Total funding raised, e.g., $50M" },
                      valuation: { type: "string", description: "Current or last known valuation" },
                      employeeCount: { type: "number", nullable: true },
                      industry: { type: "string" },
                      status: { type: "string", enum: ["Active", "Acquired", "Shutdown"] }
                    },
                    required: ["name", "currentStage", "fundingRaised", "valuation", "industry", "status"]
                  },
                  lessons: {
                    type: "array",
                    description: "Exactly 10 tactical lessons",
                    minItems: 10,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string", description: "3-4 sentence detailed lesson with specific context" },
                        impactScore: { type: "integer", minimum: 1, maximum: 10 },
                        actionabilityScore: { type: "integer", minimum: 1, maximum: 10 },
                        category: { type: "string", description: "e.g., Product, Growth, Fundraising, Team" },
                        founderAttribution: { type: "string", description: "Founder's name" }
                      },
                      required: ["text", "impactScore", "actionabilityScore", "category", "founderAttribution"]
                    }
                  },
                  chavelCallouts: {
                    type: "array",
                    description: "Exactly 5 callouts relevant to travel/events startup",
                    minItems: 5,
                    maxItems: 5,
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string", description: "Specific callout relevant to travel/events" },
                        relevanceScore: { type: "integer", minimum: 1, maximum: 10 }
                      },
                      required: ["text", "relevanceScore"]
                    }
                  }
                },
                required: ["podcastSeriesName", "episodeTitle", "founderNames", "company", "lessons", "chavelCallouts"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_episode_data" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));
    
    // Extract from tool calls instead of content
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('No tool call in response:', aiData);
      throw new Error('AI did not return structured data. Please try again.');
    }
    
    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Parsed analysis:', JSON.stringify(analysis, null, 2));

    // Step 3: Find or create podcast
    const finalPodcastName = podcastName || analysis.podcastSeriesName;
    let podcastId: string;
    const { data: existingPodcast } = await supabase
      .from('podcasts')
      .select('id')
      .eq('name', finalPodcastName)
      .maybeSingle();

    if (existingPodcast) {
      podcastId = existingPodcast.id;
    } else {
      const { data: newPodcast, error: podcastError } = await supabase
        .from('podcasts')
        .insert({ name: finalPodcastName })
        .select('id')
        .single();
      
      if (podcastError) throw podcastError;
      podcastId = newPodcast.id;
    }

    // Step 4: Create or find company
    let companyId: string | null = null;
    if (analysis.company?.name) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', analysis.company.name)
        .maybeSingle();

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

        if (companyError) {
          console.error('Error creating company:', companyError);
          throw new Error(`Failed to create company: ${companyError.message} (${companyError.code})`);
        }
        companyId = newCompany.id;
      }
    }

    // Step 5: Create episode with date validation
    const isValidDate = (dateStr: string) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .insert({
        podcast_id: podcastId,
        title: analysis.episodeTitle,
        release_date: (analysis.releaseDate && isValidDate(analysis.releaseDate)) ? analysis.releaseDate : undefined,
        url: episodeUrl,
        company_id: companyId,
        founder_names: analysis.founderNames,
        analysis_status: 'completed',
      })
      .select('id')
      .single();

    if (episodeError) {
      console.error('Error creating episode:', episodeError);
      throw new Error(`Failed to create episode: ${episodeError.message} (${episodeError.code})`);
    }

    // Step 6: Insert lessons with normalization
    if (analysis.lessons?.length > 0) {
      const clampScore = (val: any) => Math.max(1, Math.min(10, Math.round(Number(val) || 5)));
      
      const lessonsToInsert = analysis.lessons.map((lesson: any) => ({
        episode_id: episode.id,
        lesson_text: lesson.text,
        impact_score: clampScore(lesson.impactScore),
        actionability_score: clampScore(lesson.actionabilityScore),
        category: lesson.category,
        founder_attribution: lesson.founderAttribution,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonsToInsert);

      if (lessonsError) {
        console.error('Error inserting lessons:', lessonsError);
        throw new Error(`Failed to save lessons: ${lessonsError.message} (${lessonsError.code})`);
      }
    }

    // Step 7: Insert chavel callouts with normalization
    if (analysis.chavelCallouts?.length > 0) {
      const clampScore = (val: any) => Math.max(1, Math.min(10, Math.round(Number(val) || 5)));
      
      const calloutsToInsert = analysis.chavelCallouts.map((callout: any) => ({
        episode_id: episode.id,
        callout_text: callout.text,
        relevance_score: clampScore(callout.relevanceScore),
      }));

      const { error: calloutsError } = await supabase
        .from('chavel_callouts')
        .insert(calloutsToInsert);

      if (calloutsError) {
        console.error('Error inserting callouts:', calloutsError);
        throw new Error(`Failed to save callouts: ${calloutsError.message} (${calloutsError.code})`);
      }
    }

    // Step 8: Generate personalized insights if startup profile provided
    if (startupProfile) {
      console.log('Generating personalized insights...');
      
      // Fetch the inserted lessons
      const { data: insertedLessons, error: fetchError } = await supabase
        .from('lessons')
        .select('id, lesson_text')
        .eq('episode_id', episode.id);

      if (fetchError || !insertedLessons) {
        console.error('Error fetching lessons for personalization:', fetchError);
      } else {
        // Generate personalized insights for each lesson
        const personalizedInsights = [];
        
        for (const lesson of insertedLessons) {
          const personalizationPrompt = `
Startup Context:
- Company: ${startupProfile.company_name}
- Stage: ${startupProfile.stage}
- Funding: ${startupProfile.funding_raised || 'Not specified'}
- Team Size: ${startupProfile.employee_count || 'Not specified'}
- Industry: ${startupProfile.industry || 'Not specified'}
- Description: ${startupProfile.description}

Universal Lesson from Episode:
"${lesson.lesson_text}"

Generate a personalized insight in JSON format:
{
  "personalizedText": "2-3 sentences explaining how this lesson specifically applies to their startup context and what they should focus on",
  "relevanceScore": 1-10 (how relevant is this lesson to their specific situation),
  "actionItems": ["Specific action 1", "Specific action 2", "Specific action 3"]
}

Make it tactical and specific to their company stage, industry, and challenges.`;

          try {
            const personalizationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'user', content: personalizationPrompt }
                ],
              }),
            });

            if (personalizationResponse.ok) {
              const personalizationData = await personalizationResponse.json();
              const content = personalizationData.choices?.[0]?.message?.content || '';
              
              try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const personalizedData = JSON.parse(jsonMatch[0]);
                  
                  personalizedInsights.push({
                    lesson_id: lesson.id,
                    startup_profile_id: null, // Can be linked later if profile was saved
                    personalized_text: personalizedData.personalizedText,
                    relevance_score: Math.max(1, Math.min(10, Math.round(Number(personalizedData.relevanceScore) || 5))),
                    action_items: personalizedData.actionItems || [],
                  });
                }
              } catch (parseError) {
                console.error('Error parsing personalized insight:', parseError);
              }
            }
          } catch (personalizationError) {
            console.error('Error generating personalized insight:', personalizationError);
          }
        }

        // Insert personalized insights
        if (personalizedInsights.length > 0) {
          const { error: insightsError } = await supabase
            .from('personalized_insights')
            .insert(personalizedInsights);

          if (insightsError) {
            console.error('Error inserting personalized insights:', insightsError);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      episodeId: episode.id,
      message: 'Episode analyzed successfully' + (startupProfile ? ' with personalized insights' : '')
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-episode:', error);
    
    // Provide detailed error messages
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
