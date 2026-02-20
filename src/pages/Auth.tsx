import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [signupForm, setSignupForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await signUp(signupForm.email, signupForm.password, signupForm.first_name, signupForm.last_name);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      toast.success('Account created successfully!');
      setTimeout(() => {
        navigate('/consultants');
      }, 500);
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginForm.email, loginForm.password);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success('Logged in successfully!');
    navigate('/consultants');
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to NeuropayX</CardTitle>
            <CardDescription>Sign up or log in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-first-name">Ad</Label>
                      <Input
                        id="signup-first-name"
                        placeholder="Ad"
                        value={signupForm.first_name}
                        onChange={(e) => setSignupForm({ ...signupForm, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-last-name">Soyad</Label>
                      <Input
                        id="signup-last-name"
                        placeholder="Soyad"
                        value={signupForm.last_name}
                        onChange={(e) => setSignupForm({ ...signupForm, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifrə</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Şifrə yaradın"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Hesab yaradılır...' : 'Qeydiyyat'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
