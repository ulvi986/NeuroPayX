import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Consultant = Tables<"consultants">;
export type ConsultantComment = Tables<"consultant_comments">;
export type ConsultantRating = Tables<"consultant_ratings">;
export type ConsultationRequest = Tables<"consultation_requests">;

export const consultantsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("consultants")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("consultants")
      .select(`
        *,
        consultant_comments(*, profiles(*)),
        consultant_ratings(*)
      `)
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAverageRating(consultantId: string) {
    const { data, error } = await supabase
      .rpc("get_consultant_avg_rating", { consultant_id: consultantId });
    
    if (error) throw error;
    return data;
  },

  async requestConsultation(consultantId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from("consultation_requests")
      .insert({ consultant_id: consultantId, user_id: userId, message })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addRating(consultantId: string, userId: string, rating: number) {
    const { data, error } = await supabase
      .from("consultant_ratings")
      .upsert({ consultant_id: consultantId, user_id: userId, rating })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addComment(consultantId: string, userId: string, comment: string) {
    const { data, error } = await supabase
      .from("consultant_comments")
      .insert({ consultant_id: consultantId, user_id: userId, comment })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserRequests(userId: string) {
    const { data, error } = await supabase
      .from("consultation_requests")
      .select("*, consultants(*)")
      .eq("user_id", userId);
    
    if (error) throw error;
    return data;
  }
};
