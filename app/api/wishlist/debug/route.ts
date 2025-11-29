import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        user: null
      });
    }

    // Try to find user in users table
    const { data: userRecord, error: userError } = await (supabase as any)
      .from('users')
      .select('user_id, full_name, email')
      .eq('email', user.email);

    // Get all users for comparison
    const { data: allUsers, error: allUsersError } = await (supabase as any)
      .from('users')
      .select('user_id, full_name, email')
      .limit(10);

    // Get favourites table sample
    const { data: favouritesSample, error: favouritesError } = await (supabase as any)
      .from('favourites')
      .select('*')
      .limit(10);

    return NextResponse.json({
      success: true,
      auth_user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      user_lookup: {
        found: userRecord,
        error: userError?.message
      },
      sample_users: {
        data: allUsers,
        error: allUsersError?.message
      },
      favourites_sample: {
        data: favouritesSample,
        error: favouritesError?.message
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}