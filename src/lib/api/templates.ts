import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Template = Tables<"templates">;
export type TemplateImage = Tables<"template_images">;
export type TemplateRating = Tables<"template_ratings">;
export type TemplateComment = Tables<"template_comments">;
export type TemplatePurchase = Tables<"template_purchases">;

export const templatesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("templates")
      .select("*, template_images(*)")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("templates")
      .select(`
        *,
        template_images(*),
        template_comments(*, profiles(*)),
        template_ratings(*)
      `)
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAverageRating(templateId: string) {
    const { data, error } = await supabase
      .rpc("get_template_avg_rating", { template_id: templateId });
    
    if (error) throw error;
    return data;
  },

  async purchase(templateId: string, userId: string) {
    const { data, error } = await supabase
      .from("template_purchases")
      .insert({ template_id: templateId, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addRating(templateId: string, userId: string, rating: number) {
    const { data, error } = await supabase
      .from("template_ratings")
      .upsert({ template_id: templateId, user_id: userId, rating })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addComment(templateId: string, userId: string, comment: string) {
    const { data, error } = await supabase
      .from("template_comments")
      .insert({ template_id: templateId, user_id: userId, comment })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserPurchases(userId: string) {
    const { data, error } = await supabase
      .from("template_purchases")
      .select("*, templates(*, template_images(*))")
      .eq("user_id", userId);
    
    if (error) throw error;
    return data;
  },

  async checkPurchase(templateId: string, userId: string) {
    const { data, error } = await supabase
      .from("template_purchases")
      .select("id")
      .eq("template_id", templateId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  }
};
