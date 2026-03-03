import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_id, passcode, action, payload } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate passcode
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, admin_passcode, reveal_matches, name, host_name")
      .eq("id", event_id)
      .single();

    if (eventErr || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.admin_passcode !== passcode) {
      return new Response(JSON.stringify({ error: "Invalid passcode" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any = null;

    switch (action) {
      case "verify": {
        result = { verified: true, event: { id: event.id, name: event.name, host_name: event.host_name, reveal_matches: event.reveal_matches } };
        break;
      }
      case "toggle_reveal": {
        const newVal = payload?.reveal ?? !event.reveal_matches;
        const { data, error } = await supabase
          .from("events")
          .update({ reveal_matches: newVal })
          .eq("id", event_id)
          .select("id, name, host_name, reveal_matches, start_time, created_at")
          .single();
        if (error) throw error;
        result = data;
        break;
      }
      case "get_guests": {
        const { data, error } = await supabase
          .from("guests")
          .select("*")
          .eq("event_id", event_id);
        if (error) throw error;
        result = data;
        break;
      }
      case "get_stats": {
        const { data: guests } = await supabase
          .from("guests")
          .select("id, answers")
          .eq("event_id", event_id);
        result = {
          total_guests: guests?.length || 0,
          completed: guests?.filter((g: any) => Object.keys(g.answers || {}).length > 0).length || 0,
        };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
