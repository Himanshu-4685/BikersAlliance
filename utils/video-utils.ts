import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function checkVideoAvailability() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await (supabase as any)
      .from('videos')
      .select('id')
      .eq('is_published', true)
      .limit(1);

    if (error) {
      console.error('Error checking video availability:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('Error in checkVideoAvailability:', err);
    return false;
  }
}

export async function getVideosCount() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { count, error } = await (supabase as any)
      .from('videos')
      .select('id', { count: 'exact' })
      .eq('is_published', true);

    if (error) {
      console.error('Error getting videos count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error in getVideosCount:', err);
    return 0;
  }
}