import { supabase } from "@/integrations/supabase/client";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  memberCount: number;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  joined_at: string;
}

export const communityApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("communities" as any)
      .select(`*, community_members(count)`)
      .order("name");

    if (error) throw error;
    return (data as any[])?.map((community: any) => ({
      ...community,
      memberCount: community.community_members?.[0]?.count || 0
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("communities" as any)
      .select(`*, community_members(*, profiles(*))`)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as any;
  },

  async join(communityId: string, userId: string) {
    const { data, error } = await supabase
      .from("community_members" as any)
      .insert({ community_id: communityId, user_id: userId } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async leave(communityId: string, userId: string) {
    const { error } = await supabase
      .from("community_members" as any)
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async getUserCommunities(userId: string) {
    const { data, error } = await supabase
      .from("community_members" as any)
      .select("*, communities(*)")
      .eq("user_id", userId);

    if (error) throw error;
    return data as any[];
  },

  async checkMembership(communityId: string, userId: string) {
    const { data, error } = await supabase
      .from("community_members" as any)
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async sendMessage(communityId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from("community_messages" as any)
      .insert({ community_id: communityId, user_id: userId, message } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(communityId: string) {
    const { data, error } = await supabase
      .from("community_messages" as any)
      .select(`*, profiles(first_name, last_name, avatar_url)`)
      .eq("community_id", communityId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as any[];
  }
};
