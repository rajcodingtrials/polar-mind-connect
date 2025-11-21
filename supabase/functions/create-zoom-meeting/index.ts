import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ZoomMeetingRequest {
  sessionId: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  therapistName: string;
  clientName: string;
  timezone?: string;
}

// Get Zoom OAuth token
async function getZoomAccessToken(): Promise<string> {
  const accountId = Deno.env.get('ZOOM_ACCOUNT_ID');
  const clientId = Deno.env.get('ZOOM_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Missing Zoom credentials');
  }

  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get Zoom access token:', error);
    throw new Error(`Failed to get Zoom access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create Zoom meeting
async function createZoomMeeting(
  accessToken: string,
  meetingData: {
    topic: string;
    startTime: string;
    duration: number;
    timezone: string;
  }
) {
  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: meetingData.topic,
      type: 2, // Scheduled meeting
      start_time: meetingData.startTime,
      duration: meetingData.duration,
      timezone: meetingData.timezone,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        audio: 'both',
        auto_recording: 'none',
        approval_type: 0, // Automatically approve
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to create Zoom meeting:', error);
    throw new Error(`Failed to create Zoom meeting: ${response.statusText}`);
  }

  return await response.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sessionId,
      sessionDate,
      startTime,
      durationMinutes,
      therapistName,
      clientName,
      timezone = 'UTC',
    }: ZoomMeetingRequest = await req.json();

    console.log('Creating Zoom meeting for session:', sessionId);
    console.log('Input data:', { sessionDate, startTime, timezone, durationMinutes });

    // Format the start time for Zoom (ISO 8601 format)
    // startTime comes as "HH:MM:SS", we need "yyyy-MM-ddTHH:mm:ss"
    const timePart = startTime.substring(0, 5); // Get HH:MM only
    const startDateTime = `${sessionDate}T${timePart}:00`;
    const topic = `Therapy Session - ${therapistName} & ${clientName}`;
    
    console.log('Formatted start time for Zoom:', startDateTime);

    // Get Zoom access token
    const accessToken = await getZoomAccessToken();

    // Create the Zoom meeting
    const zoomMeeting = await createZoomMeeting(accessToken, {
      topic,
      startTime: startDateTime,
      duration: durationMinutes,
      timezone,
    });

    console.log('Zoom meeting created:', zoomMeeting.id);

    // Update the therapy session with meeting details
    const { error: updateError } = await supabase
      .from('therapy_sessions')
      .update({
        meeting_link: zoomMeeting.join_url,
        zoom_meeting_id: String(zoomMeeting.id),
        zoom_password: zoomMeeting.password || null,
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to update session with meeting details:', updateError);
      throw new Error('Failed to update session with meeting details');
    }

    console.log('Session updated with Zoom meeting details');

    return new Response(
      JSON.stringify({
        success: true,
        meetingLink: zoomMeeting.join_url,
        meetingId: String(zoomMeeting.id),
        password: zoomMeeting.password,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in create-zoom-meeting function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
