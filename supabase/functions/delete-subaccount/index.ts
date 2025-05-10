import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const { agency_id, user_id } = await req.json();

    if (!agency_id || !user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'agency_id and user_id are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the user's role and parent_id from the profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, parent_id')
      .eq('id', agency_id)
      .single();

    if (profileError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to get user profile',
        details: profileError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const isAdmin = profile?.role === 'admin';
    const isParent = profile?.id === agency_id;

    // Check if the user making the request is authorized
    // Either they are an admin or they are the parent of the subaccount
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('profiles')
      .select('id, parent_id, email')
      .eq('id', user_id)
      .single();

    if (subaccountError) {
      console.error('--- Error fetching subaccount profile ---');
      console.error('User ID causing error:', user_id);
      console.error('Subaccount Error Object:', subaccountError);
      console.error('Subaccount Error JSON:', JSON.stringify(subaccountError, null, 2));
      console.error('--------------------------------------');
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to get subaccount profile',
        details: subaccountError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if the user is authorized to delete this subaccount
    if (!isAdmin && subaccount.parent_id !== agency_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized: You can only delete your own subaccounts'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Start a transaction to ensure data consistency
    // First, check if there's a record in agency_subaccounts
    const { data: agencySubaccount, error: agencySubaccountError } = await supabaseAdmin
      .from('agency_subaccounts')
      .select('id')
      .eq('email', subaccount.email)
      .maybeSingle();

    if (agencySubaccountError) {
      console.error('Error checking agency_subaccounts:', agencySubaccountError);
      // Continue with the deletion even if we can't find the agency_subaccount record
    }

    // If we found an agency_subaccount record, delete it
    if (agencySubaccount) {
      const { error: deleteSubaccountError } = await supabaseAdmin
        .from('agency_subaccounts')
        .delete()
        .eq('id', agencySubaccount.id);

      if (deleteSubaccountError) {
        console.error('Error deleting from agency_subaccounts:', deleteSubaccountError);
        // Continue with the user deletion even if we can't delete the agency_subaccount
      }
    }

    // Delete the user from auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (deleteUserError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to delete user',
        details: deleteUserError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Log the activity
    await supabaseAdmin.from('activities').insert([
      {
        user_id: agency_id,
        action: 'subaccount_deleted',
        details: {
          message: `サブアカウント「${subaccount.email}」を削除しました`,
          subaccount_id: user_id,
          subaccount_email: subaccount.email
        }
      }
    ]);

    return new Response(JSON.stringify({
      success: true,
      message: 'Subaccount deleted successfully'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in delete-subaccount function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});