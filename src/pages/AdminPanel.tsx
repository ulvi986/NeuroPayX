import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { adminApi } from "@/lib/api/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, ShieldAlert, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      adminApi.checkIsAdmin(user.id).then(setIsAdmin);
    }
  }, [user, loading, navigate]);

  if (loading || isAdmin === null) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-3xl font-bold">Giriş qadağandır</h1>
          <p className="text-muted-foreground">Bu səhifəyə yalnız adminlər daxil ola bilər.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Admin Panel</h1>

        <ConsultantsTab userId={user!.id} />
      </div>
    </Layout>
  );
}

// ─── Consultants Tab ────────────────────────────────────────

function ConsultantsTab({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    experience: "",
    email: "",
    price_per_hour: "0",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: consultants, isLoading } = useQuery({
    queryKey: ["admin-consultants"],
    queryFn: adminApi.getAllConsultants,
  });

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await supabase.storage.from('consultant-photos').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('consultant-photos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let photo_url: string | undefined;
      if (photoFile) {
        photo_url = await uploadPhoto(photoFile);
      }
      return adminApi.createConsultant({
        user_id: userId,
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio || undefined,
        experience: form.experience || undefined,
        email: form.email || undefined,
        photo_url,
        price_per_hour: parseFloat(form.price_per_hour) || 0,
      });
    },
    onSuccess: () => {
      toast.success("Məsləhətçi yaradıldı!");
      queryClient.invalidateQueries({ queryKey: ["admin-consultants"] });
      setDialogOpen(false);
      setForm({ first_name: "", last_name: "", bio: "", experience: "", email: "", price_per_hour: "0" });
      setPhotoFile(null);
      setUploading(false);
    },
    onError: (err: any) => {
      toast.error(err.message);
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteConsultant,
    onSuccess: () => {
      toast.success("Məsləhətçi silindi!");
      queryClient.invalidateQueries({ queryKey: ["admin-consultants"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Məsləhətçilər</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> Yeni
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Məsləhətçi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad *</Label>
                  <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Soyad *</Label>
                  <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Təcrübə</Label>
                <Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="Məs: 5 il Full-Stack Developer" />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Şəkil</Label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {photoFile ? photoFile.name : "Şəkil seçin"}
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Email (Gmail)</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@gmail.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Qiymət ($/saat)</Label>
                <Input type="number" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.first_name || !form.last_name || createMutation.isPending || uploading} className="w-full">
                {createMutation.isPending || uploading ? "Yaradılır..." : "Yarat"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : consultants && consultants.length > 0 ? (
          <div className="space-y-3">
            {consultants.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{c.first_name} {c.last_name}</p>
                  <p className="text-sm text-muted-foreground">{c.experience || "Təcrübə qeyd edilməyib"}</p>
                </div>
                <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(c.id)} disabled={deleteMutation.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Məsləhətçi yoxdur.</p>
        )}
      </CardContent>
    </Card>
  );
}

