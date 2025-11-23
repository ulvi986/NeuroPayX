-- Create community_messages table for group chat
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_messages
CREATE POLICY "Community members can view messages"
  ON public.community_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can send messages"
  ON public.community_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Enable realtime for community_messages
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Create index for better query performance
CREATE INDEX idx_community_messages_community_id ON public.community_messages(community_id);
CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at DESC);