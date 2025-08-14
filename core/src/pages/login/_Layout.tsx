import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { loginWithCredentials, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");

    try {
      await loginWithCredentials(data.email, data.password);
      navigate("/");
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
    }
  };

  const fillDemoCredentials = (role: "admin" | "organizer" | "staff") => {
    const credentials = {
      admin: { email: "admin@beyblade.com", password: "admin123" },
      organizer: { email: "organizer@beyblade.com", password: "organizer123" },
      staff: { email: "staff@beyblade.com", password: "staff123" },
    };

    setValue("email", credentials[role].email);
    setValue("password", credentials[role].password);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Beyblade Pro
              </span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tournament Management System
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 px-4 py-3">
                    <p className="text-sm text-red-700 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={isLoading}
                        {...register("password")}
                        className={`pr-10 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>

                  {/* Demo Credentials - Only show in development */}
                  {import.meta.env.DEV && (
                    <div className="space-y-2">
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">
                          Demo Accounts
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => fillDemoCredentials("admin")}
                          disabled={isLoading}
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Admin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => fillDemoCredentials("organizer")}
                          disabled={isLoading}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Organizer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => fillDemoCredentials("staff")}
                          disabled={isLoading}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Staff
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary flex-col justify-center px-12 py-8">
        <div className="text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold">Beyblade Pro</span>
          </div>

          <h2 className="text-4xl font-bold mb-6">
            Tournament Management Made Easy
          </h2>

          <p className="text-xl text-primary-foreground/80 mb-8">
            Organize, manage, and track Beyblade tournaments with precision and
            style. From participant registration to championship brackets.
          </p>

          <ul className="space-y-4 text-primary-foreground/90">
            <li className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              Schedule and manage tournaments effortlessly
            </li>
            <li className="flex items-center gap-3">
              <Trophy className="h-5 w-5" />
              Track participant performance and rankings
            </li>
            <li className="flex items-center gap-3">
              <Lock className="h-5 w-5" />
              Secure arena booking and capacity management
            </li>
          </ul>

          <p className="mt-12 text-sm text-primary-foreground/60">
            Version 1.0 - Tournament Edition
          </p>
        </div>
      </div>
    </div>
  );
}
