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
    const { dest, otp, userData } = await req.json();
    
    if (!dest || !otp) {
      console.error('Missing phone number or OTP');
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', dest)
      .eq('otp_code', otp)
      .eq('verified', false)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching OTP:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRecord) {
      console.log('Invalid OTP attempted for:', dest);
      return new Response(
        JSON.stringify({ error: 'Invalid OTP code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP has expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      console.log('Expired OTP attempted for:', dest);
      // Delete expired OTP
      await supabase.from('otp_codes').delete().eq('id', otpRecord.id);
      return new Response(
        JSON.stringify({ error: 'OTP has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified and delete it
    await supabase.from('otp_codes').delete().eq('id', otpRecord.id);

    console.log('OTP verified successfully for:', dest);

    // Check if user with this phone already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone_number', dest)
      .maybeSingle();

    if (existingProfile) {
      // User exists - generate a magic link token for them
      // Since we can't directly create a session, we return that they need to use email login
      // Or we could use a custom token approach
      console.log('Existing user found for phone:', dest);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          isNewUser: false,
          message: 'Phone verified. Please use your email to complete login.',
          phone: dest
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // New user - they need to complete signup
    // If userData is provided, create the account now
    if (userData && userData.email && userData.password && userData.fullName) {
      console.log('Creating new user with phone:', dest);
      
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role || 'patient',
          age: userData.age,
          gender: userData.gender,
          phone_number: dest
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the profile with phone number
      if (authData.user) {
        await supabase
          .from('profiles')
          .update({ phone_number: dest })
          .eq('user_id', authData.user.id);
      }

      console.log('User created successfully:', authData.user?.id);

      return new Response(
        JSON.stringify({ 
          success: true,
          isNewUser: true,
          userCreated: true,
          message: 'Account created successfully. Please sign in with your email.',
          phone: dest
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // New user but no userData provided - they need to complete signup
    return new Response(
      JSON.stringify({ 
        success: true,
        isNewUser: true,
        userCreated: false,
        message: 'Phone verified. Please complete your registration.',
        phone: dest
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
