import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const profilesApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from("profiles" as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as any as Profile;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("profiles" as any)
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data as any as Profile;
  },

  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles" as any)
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as any as Profile;
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
