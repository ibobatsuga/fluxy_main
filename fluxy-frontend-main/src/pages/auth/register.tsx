import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "@/components/layout/auth-shell";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const INDUSTRY_OPTIONS = [
  "E-commerce / Online Shop",
  "Food & Beverage",
  "Fashion & Clothing",
  "Beauty & Skincare",
  "Health & Wellness",
  "Education",
  "Real Estate",
  "Automotive",
  "Technology / IT Services",
  "Professional Services",
  "Retail / Offline Store",
  "Hospitality & Tourism",
  "Media & Entertainment",
  "Agriculture",
  "Manufacturing",
  "Lainnya",
];

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    business_name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
    industry_category: z.string().min(1, "Pilih kategori industri"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        ...data,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      toast.success("Registrasi berhasil! Menunggu persetujuan admin.");
      navigate("/pending-approval");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Registrasi gagal. Silakan coba lagi."));
    }
  };

  return (
    <AuthShell>
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
          <CardDescription>
            Daftar untuk memulai menggunakan AI Employees
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" placeholder="John Doe" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name">Nama Bisnis</Label>
                <Input
                  id="business_name"
                  placeholder="Toko Maju Jaya"
                  {...register("business_name")}
                />
                {errors.business_name && (
                  <p className="text-xs text-destructive">{errors.business_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry_category">Kategori Industri</Label>
                <select
                  id="industry_category"
                  className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3.5 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("industry_category")}
                >
                  <option value="">Pilih kategori industri</option>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.industry_category && (
                  <p className="text-xs text-destructive">
                    {errors.industry_category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@bisnis.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Ulangi password"
                  {...register("password_confirmation")}
                />
                {errors.password_confirmation && (
                  <p className="text-xs text-destructive">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? "Mendaftar..." : "Daftar"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Sudah punya akun? </span>
              <Link to="/login" className="font-medium text-violet-600 hover:underline">
                Masuk
              </Link>
            </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
