import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Community = Tables<"communities">;
export type CommunityMember = Tables<"community_members">;

export const communityApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("communities")
      .select(`
        *,
        community_members(count)
      `)
      .order("name");
    
    if (error) throw error;
    return data?.map(community => ({
      ...community,
      memberCount: community.community_members?.[0]?.count || 0
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("communities")
      .select(`
        *,
        community_members(*, profiles(*))
      `)
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async join(communityId: string, userId: string) {
    const { data, error } = await supabase
      .from("community_members")
      .insert({ community_id: communityId, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async leave(communityId: string, userId: string) {
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);
    
    if (error) throw error;
  },

  async getUserCommunities(userId: string) {
    const { data, error } = await supabase
      .from("community_members")
      .select("*, communities(*)")
      .eq("user_id", userId);
    
    if (error) throw error;
    return data;
  },

  async checkMembership(communityId: string, userId: string) {
    const { data, error } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },

  async sendMessage(communityId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from("community_messages")
      .insert({ community_id: communityId, user_id: userId, message })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMessages(communityId: string) {
    const { data, error } = await supabase
      .from("community_messages")
      .select(`
        *,
        profiles(first_name, last_name, avatar_url)
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
