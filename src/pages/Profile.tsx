import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

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
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
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
      </div>
    </Layout>
  );
}
