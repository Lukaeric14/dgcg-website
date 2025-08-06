import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Add error handling for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    key: supabaseAnonKey ? 'SET' : 'MISSING'
  });
}

// Create a safe Supabase client that won't crash the app
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Add a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Test function to verify Supabase setup
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('Key:', supabaseAnonKey ? 'SET' : 'MISSING');

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { user: !!user, error: authError });

    // Test storage bucket access
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('Storage buckets:', buckets);
    console.log('Bucket error:', bucketError);

    // Test specific bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('user-avatars')
      .list('', { limit: 1 });
    console.log('user-avatars bucket test:', { files, error: filesError });

    return { success: true, user: !!user, buckets: !!buckets };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error };
  }
};

// Utility function to upload user avatar
export const uploadUserAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    console.log('Starting upload for user:', userId);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    // Change the path structure to match RLS policy: userId/filename
    const filePath = `${userId}/${fileName}`;

    console.log('Upload path:', filePath);

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.error('Supabase not properly configured');
      return null;
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    console.log('Uploading to bucket: user-avatars');
    const { data, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      console.error('Error details:', {
        message: uploadError.message,
        name: uploadError.name
      });
      return null;
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    // Update the users_profiles table with the new avatar URL
    const { error: profileError } = await supabase
      .from('users_profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      // Don't return null here - the upload was successful, just the profile update failed
    } else {
      console.log('User profile updated with new avatar URL');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadUserAvatar:', error);
    return null;
  }
};

// Utility function to get user profile data
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// Utility function to update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

// Utility function to delete user avatar
export const deleteUserAvatar = async (userId: string): Promise<boolean> => {
  try {
    console.log('Deleting avatar for user:', userId);

    // Get the current user profile to find the avatar URL
    const profile = await getUserProfile(userId);
    if (!profile?.avatar_url) {
      console.log('No avatar URL found for user');
      return true; // No avatar to delete
    }

    // Extract the file path from the avatar URL
    const url = new URL(profile.avatar_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get userId/filename

    console.log('Deleting file path:', filePath);

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('user-avatars')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting avatar from storage:', deleteError);
      return false;
    }

    // Update the users_profiles table to remove the avatar URL
    const { error: profileError } = await supabase
      .from('users_profiles')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return false;
    }

    console.log('Avatar deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteUserAvatar:', error);
    return false;
  }
};
