import { supabase } from "@/integrations/supabase/client";

export const adminApi = {
  async checkIsAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  // Consultants
  async createConsultant(consultant: {
    user_id: string;
    first_name: string;
    last_name: string;
    bio?: string;
    experience?: string;
    email?: string;
    photo_url?: string;
    price_per_hour?: number;
  }) {
    const { data, error } = await supabase
      .from("consultants" as any)
      .insert(consultant as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteConsultant(id: string) {
    const { error } = await supabase
      .from("consultants" as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async getAllConsultants() {
    const { data, error } = await supabase
      .from("consultants" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as any[];
  },

  // Templates
  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from("templates" as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async getAllTemplates() {
    const { data, error } = await supabase
      .from("templates" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as any[];
  },

  // Communities
  async createCommunity(community: { name: string; description?: string }) {
    const { data, error } = await supabase
      .from("communities" as any)
      .insert(community as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCommunity(id: string) {
    const { error } = await supabase
      .from("communities" as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async getAllCommunities() {
    const { data, error } = await supabase
      .from("communities" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as any[];
  },
};
