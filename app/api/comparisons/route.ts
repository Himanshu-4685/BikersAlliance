import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantIds, comparisonName, userId } = body;

    // Validation
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User authentication required'
      }, { status: 401 });
    }

    if (!variantIds || !Array.isArray(variantIds) || variantIds.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 variant IDs are required for comparison'
      }, { status: 400 });
    }

    if (variantIds.length > 6) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 6 variants allowed for comparison'
      }, { status: 400 });
    }

    // First get the auth user to get their email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user authentication'
      }, { status: 401 });
    }

    // Verify user exists in our users table, if not create them
    let userData;
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('user_id, email')
      .eq('email', authUser.user.email)  // Use email to find user since we don't have user_uuid column
      .single();

    if (userError || !existingUser) {
      // User doesn't exist in users table, create them
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.fullName || authUser.user.user_metadata?.full_name || null,
          Img_url: authUser.user.user_metadata?.avatarUrl || authUser.user.user_metadata?.avatar_url || null,
          phone: authUser.user.user_metadata?.phone || null,
          created_at: new Date().toISOString()
        })
        .select('user_id')
        .single();

      if (createUserError || !newUser) {
        console.error('Error creating user:', createUserError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create user record'
        }, { status: 500 });
      }

      userData = newUser;
    } else {
      userData = existingUser;
    }

    // Verify all variant IDs exist
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select('variant_id, variant_name')
      .in('variant_id', variantIds);

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
      return NextResponse.json({
        success: false,
        error: 'Error verifying variants'
      }, { status: 500 });
    }

    if (!variants || variants.length !== variantIds.length) {
      return NextResponse.json({
        success: false,
        error: 'Some variant IDs are invalid'
      }, { status: 400 });
    }

    // Prepare data for insertion
    const comparisonData = {
      user_id: userData.user_id,
      variant_id_1: variantIds[0],
      variant_id_2: variantIds[1],
      variant_id_3: variantIds[2] || null,
      variant_id_4: variantIds[3] || null,
      created_at: new Date().toISOString()
    };

    // Save to database
    const { data: savedComparison, error: saveError } = await supabase
      .from('comparisons')
      .insert(comparisonData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving comparison:', saveError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save comparison'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        comparisonId: savedComparison.comparison_id,
        message: 'Comparison saved successfully'
      }
    });

  } catch (error) {
    console.error('Error in save comparison API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User authentication required'
      }, { status: 401 });
    }

    // First get the auth user to get their email  
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user authentication'
      }, { status: 401 });
    }

    // Verify user exists in our users table, if not create them
    let userData;
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('user_id, email')
      .eq('email', authUser.user.email)
      .single();

    if (userError || !existingUser) {
      // User doesn't exist in users table, create them
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.fullName || authUser.user.user_metadata?.full_name || null,
          Img_url: authUser.user.user_metadata?.avatarUrl || authUser.user.user_metadata?.avatar_url || null,
          phone: authUser.user.user_metadata?.phone || null,
          created_at: new Date().toISOString()
        })
        .select('user_id')
        .single();

      if (createUserError || !newUser) {
        console.error('Error creating user:', createUserError);
        // If user creation fails, still return empty comparisons rather than error
        return NextResponse.json({
          success: true,
          data: { comparisons: [] }
        });
      }

      userData = newUser;
    } else {
      userData = existingUser;
    }

    // Fetch user's saved comparisons with variant details
    const { data: comparisons, error: comparisonsError } = await supabase
      .from('comparisons')
      .select(`
        comparison_id,
        created_at,
        variant_id_1,
        variant_id_2,
        variant_id_3,
        variant_id_4
      `)
      .eq('user_id', userData.user_id)
      .order('created_at', { ascending: false });

    if (comparisonsError) {
      console.error('Error fetching comparisons:', comparisonsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch saved comparisons'
      }, { status: 500 });
    }

    // For each comparison, fetch the variant details
    const comparisonsWithDetails = await Promise.all(
      (comparisons || []).map(async (comparison) => {
        const variantIds = [
          comparison.variant_id_1,
          comparison.variant_id_2,
          comparison.variant_id_3,
          comparison.variant_id_4
        ].filter(Boolean);

        // Fetch variant details
        const { data: variants } = await supabase
          .from('variants')
          .select(`
            variant_id,
            variant_name,
            on_road_price,
            models!inner(
              model_name,
              brands!inner(
                brand_name,
                logo_url
              )
            )
          `)
          .in('variant_id', variantIds)
          .order('variant_id');

        // Generate a default comparison name based on the bikes
        const comparisonName = variants && variants.length > 0 
          ? `${(variants[0] as any).models.brands.brand_name} ${(variants[0] as any).models.model_name} vs ${variants.length - 1} other${variants.length > 2 ? 's' : ''}`
          : 'Bike Comparison';

        return {
          ...comparison,
          comparison_name: comparisonName,
          variants: variants || [],
          variantCount: variantIds.length
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        comparisons: comparisonsWithDetails
      }
    });

  } catch (error) {
    console.error('Error in get saved comparisons API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const comparisonId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User authentication required'
      }, { status: 401 });
    }

    if (!comparisonId) {
      return NextResponse.json({
        success: false,
        error: 'Comparison ID is required'
      }, { status: 400 });
    }

    // First get the auth user to get their email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user authentication'
      }, { status: 401 });
    }

    // Verify user exists and owns the comparison
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', authUser.user.email)
      .single();

    if (userError || !userData) {
      // If user doesn't exist in our custom table, they can't have saved comparisons
      return NextResponse.json({
        success: false,
        error: 'No saved comparisons found'
      }, { status: 404 });
    }

    // Delete the comparison
    const { error: deleteError } = await supabase
      .from('comparisons')
      .delete()
      .eq('comparison_id', comparisonId)
      .eq('user_id', userData.user_id);

    if (deleteError) {
      console.error('Error deleting comparison:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete comparison'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Comparison deleted successfully'
    });

  } catch (error) {
    console.error('Error in delete comparison API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}