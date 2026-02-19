import { supabase } from "@/integrations/supabase/client";

export interface Consultant {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  experience: string | null;
  photo_url: string | null;
  price_per_hour: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  consultant_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  consultants?: Consultant;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: { first_name: string | null; last_name: string | null; avatar_url: string | null };
}

export const consultantsApi = {
  async getAll(): Promise<Consultant[]> {
    const { data, error } = await supabase
      .from("consultants" as any)
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as any as Consultant[];
  },

  async getById(id: string): Promise<Consultant> {
    const { data, error } = await supabase
      .from("consultants" as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as any as Consultant;
  },

  async getOrCreateConversation(consultantId: string, userId: string): Promise<string> {
    // Check existing
    const { data: existing } = await supabase
      .from("conversations" as any)
      .select("id")
      .eq("consultant_id", consultantId)
      .eq("user_id", userId)
      .single();

    if (existing) return (existing as any).id;

    const { data, error } = await supabase
      .from("conversations" as any)
      .insert({ consultant_id: consultantId, user_id: userId } as any)
      .select("id")
      .single();

    if (error) throw error;
    return (data as any).id;
  },

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages" as any)
      .select("*, profiles:sender_id(first_name, last_name, avatar_url)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as any as Message[];
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { error } = await supabase
      .from("messages" as any)
      .insert({ conversation_id: conversationId, sender_id: senderId, content } as any);

    if (error) throw error;
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from("conversations" as any)
      .select("*, consultants(*)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data as any as Conversation[];
  },
};
