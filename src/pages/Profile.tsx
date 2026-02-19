import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [consultant, setConsultant] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }

    // Check if user is a consultant by matching email
    const userEmail = user.email;
    if (userEmail) {
      const { data: consultantData } = await supabase
        .from('consultants')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (consultantData) {
        setConsultant(consultantData);
        // Assign consultant role if not already assigned
        await supabase
          .from('user_roles' as any)
          .upsert(
            { user_id: user.id, role: 'consultant' } as any,
            { onConflict: 'user_id,role' }
          );

        // Fetch conversations for this consultant
        const { data: convos } = await supabase
          .from('conversations')
          .select('*, profiles!conversations_user_id_fkey(first_name, last_name, email)')
          .eq('consultant_id', consultantData.id)
          .order('updated_at', { ascending: false });

        if (convos) {
          // Fetch user profiles for each conversation
          const convoWithProfiles = await Promise.all(
            (convos as any[]).map(async (conv: any) => {
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('user_id', conv.user_id)
                .maybeSingle();
              return { ...conv, userProfile };
            })
          );
          setConversations(convoWithProfiles);
        }
      }
    }

    setProfileLoading(false);
  };

  if (loading || profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle>Profilim</CardTitle>
              {consultant && (
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  Məsləhətçi
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              {profile?.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile avatar" 
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Ad qeyd edilməyib'}
                </p>
                <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Üzv olub: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('az-AZ') : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultant conversations section */}
        {consultant && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mesajlarım
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <Link
                      key={conv.id}
                      to={`/conversations/${conv.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {conv.userProfile
                            ? `${conv.userProfile.first_name || ''} ${conv.userProfile.last_name || ''}`.trim() || conv.userProfile.email
                            : 'İstifadəçi'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleDateString('az-AZ')}
                        </p>
                      </div>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  Hələ mesaj yoxdur.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
