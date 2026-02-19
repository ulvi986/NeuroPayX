import { supabase } from "@/integrations/supabase/client";

export interface Template {
  id: string;
  name: string;
  description: string | null;
  price: number;
  user_id: string;
  created_at: string;
  template_images?: any[];
}

export const templatesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("templates" as any)
      .select("*, template_images(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("templates" as any)
      .select(`*, template_images(*), template_comments(*, profiles(*)), template_ratings(*)`)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as any;
  },

  async getAverageRating(templateId: string) {
    const { data, error } = await (supabase as any)
      .rpc("get_template_avg_rating", { template_id: templateId });

    if (error) throw error;
    return data;
  },

  async purchase(templateId: string, userId: string) {
    const { data, error } = await supabase
      .from("template_purchases" as any)
      .insert({ template_id: templateId, user_id: userId } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addRating(templateId: string, userId: string, rating: number) {
    const { data, error } = await supabase
      .from("template_ratings" as any)
      .upsert({ template_id: templateId, user_id: userId, rating } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addComment(templateId: string, userId: string, comment: string) {
    const { data, error } = await supabase
      .from("template_comments" as any)
      .insert({ template_id: templateId, user_id: userId, comment } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserPurchases(userId: string) {
    const { data, error } = await supabase
      .from("template_purchases" as any)
      .select("*, templates(*, template_images(*))")
      .eq("user_id", userId);

    if (error) throw error;
    return data as any[];
  },

  async checkPurchase(templateId: string, userId: string) {
    const { data, error } = await supabase
      .from("template_purchases" as any)
      .select("id")
      .eq("template_id", templateId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};
