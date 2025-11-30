import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

// Helper function to format date for database
const formatDateForDatabase = (dateString: string): string | null => {
  if (!dateString || dateString.trim() === '') {
    return null;
  }
  
  console.log('Received date string:', dateString);
  
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('Date already in YYYY-MM-DD format:', dateString);
      return dateString;
    }
    
    // Handle DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      
      // Validate day and month ranges
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
        console.error('Invalid day or month:', { day: dayNum, month: monthNum });
        return null;
      }
      
      // Format with zero-padding
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      const convertedDate = `${year}-${paddedMonth}-${paddedDay}`;
      console.log('Converted DD-MM-YYYY to YYYY-MM-DD:', dateString, '->', convertedDate);
      
      // Validate the converted date by creating a Date object
      const testDate = new Date(year + '-' + paddedMonth + '-' + paddedDay);
      if (isNaN(testDate.getTime())) {
        console.error('Invalid date after conversion:', convertedDate);
        return null;
      }
      
      // Double-check that the parsed date matches our input (to catch invalid dates like Feb 30)
      if (testDate.getFullYear() !== parseInt(year, 10) || 
          testDate.getMonth() !== parseInt(month, 10) - 1 || 
          testDate.getDate() !== parseInt(day, 10)) {
        console.error('Date validation failed - possible invalid date:', dateString);
        return null;
      }
      
      return convertedDate;
    }
    
    // Handle DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      const convertedDate = `${year}-${month}-${day}`;
      console.log('Converted DD/MM/YYYY to YYYY-MM-DD:', dateString, '->', convertedDate);
      
      // Validate the converted date
      const testDate = new Date(convertedDate);
      if (isNaN(testDate.getTime())) {
        console.error('Invalid date after conversion:', convertedDate);
        return null;
      }
      
      return convertedDate;
    }
    
    // Try to parse as Date and convert to ISO format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Could not parse date:', dateString);
      return null;
    }
    
    const isoDate = date.toISOString().split('T')[0];
    console.log('Parsed and converted to ISO:', dateString, '->', isoDate);
    return isoDate;
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
};

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - List status with pagination and search
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    let query = supabase
      .from('status')
      .select(`
        status_id,
        brand_id,
        model_id,
        variant_id,
        status,
        price_range,
        expected_launch,
        launch_date,
        created_at,
        updated_at,
        brands!inner(
          brand_name
        ),
        models!inner(
          model_name
        ),
        variants!inner(
          variant_name
        )
      `);

    // Add search filter
    if (search) {
      query = query.or(`models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Get total count
    const { count } = await supabase
      .from('status')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: statuses, error } = await query
      .order('status_id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Format status data
    const formattedStatuses = (statuses || []).map((statusItem: any) => ({
      status_id: statusItem.status_id,
      model_id: statusItem.model_id,
      variant_id: statusItem.variant_id,
      status_type: statusItem.status,
      launch_date: statusItem.launch_date,
      expected_launch: statusItem.expected_launch,
      price_range: statusItem.price_range,
      created_at: statusItem.created_at,
      model_name: statusItem.models?.model_name,
      brand_name: statusItem.brands?.brand_name,
      variant_name: statusItem.variants?.variant_name
    }));

    // Get stats
    const { data: statsData } = await supabase
      .from('status')
      .select('status');

    const stats = {
      launched: statsData?.filter((s: any) => s.status === 'new_launch').length || 0,
      upcoming: statsData?.filter((s: any) => s.status === 'upcoming').length || 0,
      discontinued: 0 // Not in your schema
    };

    return NextResponse.json({
      success: true,
      statuses: formattedStatuses,
      stats,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new status
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { status_id, brand_id, model_id, variant_id, status, price_range, expected_launch, launch_date } = body;
    
    console.log('Received status data:', { status_id, brand_id, model_id, variant_id, status, price_range, expected_launch, launch_date });

    if (!brand_id || !model_id || !variant_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Brand ID, Model ID, Variant ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status_id if provided
    if (status_id && (isNaN(Number(status_id)) || Number(status_id) <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Status ID must be a positive number' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    let statusItem;
    let error;

    // Function to find next available ID
    const findNextAvailableId = async (startId: number = 10): Promise<number> => {
      let currentId = startId;
      while (currentId <= startId + 1000) { // Safety limit
        const { data: existing } = await supabase
          .from('status')
          .select('status_id')
          .eq('status_id', currentId)
          .single();
        
        if (!existing) {
          return currentId;
        }
        currentId++;
      }
      throw new Error('Could not find available ID');
    };

    // If status_id is provided, use it directly
    if (status_id) {
      // Check if the ID already exists
      const { data: existingStatus } = await supabase
        .from('status')
        .select('status_id')
        .eq('status_id', status_id)
        .single();
      
      if (existingStatus) {
        return NextResponse.json(
          { success: false, error: `Status ID ${status_id} already exists` },
          { status: 400 }
        );
      }

        // Prepare the data with proper null handling for dates
        const insertData = {
          status_id: Number(status_id),
          brand_id,
          model_id,
          variant_id,
          status,
          price_range: price_range || null,
          expected_launch: expected_launch && expected_launch.trim() !== '' ? formatDateForDatabase(expected_launch) : null,
          launch_date: launch_date && launch_date.trim() !== '' ? formatDateForDatabase(launch_date) : null
        };      const insertResult = await (supabase as any)
        .from('status')
        .insert(insertData)
        .select()
        .single();

      statusItem = insertResult.data;
      error = insertResult.error;
    } else {
      // Auto-generate ID - find next available ID starting from 10
      try {
        const nextId = await findNextAvailableId(10);
        
        // Prepare the data with proper null handling for dates
        const insertData = {
          status_id: nextId,
          brand_id,
          model_id,
          variant_id,
          status,
          price_range: price_range || null,
          expected_launch: expected_launch && expected_launch.trim() !== '' ? formatDateForDatabase(expected_launch) : null,
          launch_date: launch_date && launch_date.trim() !== '' ? formatDateForDatabase(launch_date) : null
        };

        const insertResult = await (supabase as any)
          .from('status')
          .insert(insertData)
          .select()
          .single();

        statusItem = insertResult.data;
        error = insertResult.error;
      } catch (findIdError) {
        console.error('Error finding next ID:', findIdError);
        return NextResponse.json(
          { success: false, error: 'Could not generate status ID' },
          { status: 500 }
        );
      }
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: statusItem
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}