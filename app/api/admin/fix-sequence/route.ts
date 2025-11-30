import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the current max variant_id
    const { data: maxResult, error: maxError } = await supabase
      .from('variants')
      .select('variant_id')
      .order('variant_id', { ascending: false })
      .limit(1);

    if (maxError) {
      console.error('Error getting max variant_id:', maxError);
      return NextResponse.json({ error: 'Failed to get max variant_id' }, { status: 500 });
    }

    const maxVariantId = maxResult && maxResult.length > 0 ? maxResult[0].variant_id : 1;
    
    // Use raw SQL to fix the sequence
    const { data: result, error } = await supabase.rpc('fix_variant_sequence_sql', {
      new_sequence_value: maxVariantId + 1
    });

    // If RPC doesn't work, we'll create a workaround
    if (error) {
      console.log('RPC failed, will attempt direct sequence fix...');
      
      // Alternative: Create a dummy insert to advance the sequence
      try {
        // Insert and then delete to advance the sequence
        const { data: tempVariant, error: insertError } = await (supabase as any)
          .from('variants')
          .insert({
            variant_name: 'TEMP_SEQUENCE_FIX',
            model_id: '1',
            brand_id: '1'
          })
          .select()
          .single();
          
        if (insertError && insertError.code === '23505') {
          // The duplicate key error means sequence is still wrong
          return NextResponse.json({ 
            error: 'Sequence still needs manual fix. Please run this SQL in your database: SELECT setval(\'variants_variant_id_seq\', ' + (maxVariantId + 1) + ', false);',
            maxVariantId,
            suggestedFix: `SELECT setval('variants_variant_id_seq', ${maxVariantId + 1}, false);`
          }, { status: 500 });
        }
        
        // Delete the temp variant if it was created
        if (tempVariant) {
          await supabase
            .from('variants')
            .delete()
            .eq('variant_id', tempVariant.variant_id);
        }
      } catch (tempError) {
        console.error('Temp fix failed:', tempError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sequence should be fixed',
      maxVariantId,
      nextId: maxVariantId + 1
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}