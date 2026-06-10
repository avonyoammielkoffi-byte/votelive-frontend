import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dryfqpswposqieafhxmt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeWZxcHN3cG9zcWllYWZoeG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTEyOTYsImV4cCI6MjA5NTkyNzI5Nn0.oRuwwt_RxXn780yqMfHI2k-iMOO0Rf-_cy6NPny3Di4'
);

export const uploadPhoto = async (file) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('Photo')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('Photo')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export default supabase;