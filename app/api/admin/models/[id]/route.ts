import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - Get single model
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const modelId = params.id;

    if (!modelId) {
      return NextResponse.json(
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: model, error } = await supabase
      .from('models')
      .select(`
        model_id,
        model_name,
        brand_id,
        brands!inner(
          brand_name
        ),
        variants (
          variant_id,
          variant_name
        )
      `)
      .eq('model_id', modelId)
      .single();

    if (error || !model) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      );
    }

    const modelWithDetails = {
      model_id: (model as any).model_id,
      model_name: (model as any).model_name,
      brand_id: (model as any).brand_id,
      brand_name: (model as any).brands?.brand_name,
      variants_count: (model as any).variants ? (model as any).variants.length : 0
    };

    return NextResponse.json({
      success: true,
      model: modelWithDetails
    });

  } catch (error) {
    console.error('Model API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update model
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const modelId = params.id;

    if (!modelId) {
      return NextResponse.json(
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { model_name, brand_id } = body;

    if (!model_name || !brand_id) {
      return NextResponse.json(
        { success: false, error: 'Model name and brand are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if model exists
    const { data: existingModel } = await supabase
      .from('models')
      .select('model_id')
      .eq('model_id', modelId)
      .single();

    if (!existingModel) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      );
    }

    // Update model
    const { data: updatedModel, error } = await (supabase as any)
      .from('models')
      .update({
        model_name,
        brand_id
      })
      .eq('model_id', modelId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update model' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      model: updatedModel
    });

  } catch (error) {
    console.error('Update model error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete model
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const modelId = params.id;

    if (!modelId) {
      return NextResponse.json(
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if model exists
    const { data: existingModel } = await supabase
      .from('models')
      .select('model_id, model_name')
      .eq('model_id', modelId)
      .single();

    if (!existingModel) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      );
    }

    // Check if model has variants
    const { data: variants } = await supabase
      .from('variants')
      .select('variant_id')
      .eq('model_id', modelId)
      .limit(1);

    if (variants && variants.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete model with existing variants' },
        { status: 409 }
      );
    }

    // Delete model
    const { error } = await supabase
      .from('models')
      .delete()
      .eq('model_id', modelId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete model' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    });

  } catch (error) {
    console.error('Delete model error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}