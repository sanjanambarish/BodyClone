import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dest } = await req.json();
    
    if (!dest) {
      console.error('Missing phone number');
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(dest.replace(/\s/g, ''))) {
      console.error('Invalid phone number format:', dest);
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete any existing OTPs for this phone number
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone_number', dest);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: dest,
        otp_code: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', dest);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', `Your BodyClone verification code is: ${otp}. This code expires in 5 minutes.`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      // Delete the OTP since SMS failed
      await supabase
        .from('otp_codes')
        .delete()
        .eq('phone_number', dest);
      
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS. Please check your phone number.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SMS sent successfully via Twilio:', twilioResult.sid);

    return new Response(
      JSON.stringify({ message: 'OTP sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
