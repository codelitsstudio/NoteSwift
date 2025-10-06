"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookMarked, Eye, EyeOff, Loader2, Lock, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  const resp = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
  const loginResult = await resp.json();

  if (loginResult.success) {
    const otpResp = await fetch("/api/auth/send-otp", { method: "POST" });
    const result = await otpResp.json();
    if (result.success) {
      localStorage.setItem("isPasswordVerified", "true");
      toast({
        title: "Code Sent",
        description: "A one-time code has been sent to your email.",
      });
      router.push("/login/otp");
    } else {
      setError(result.error || "Failed to send login code. Please try again.");
      toast({
        variant: "destructive",
        title: "Failed to Send Code",
        description: result.error || "An unexpected error occurred.",
      });
    }
  } else {
    setError("Invalid username or password. Please try again.");
    toast({
      variant: "destructive",
      title: "Login Failed",
      description: loginResult.error || "Invalid credentials.",
    });
  }

  setIsLoading(false);
};


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      
      {/* Decorative Geometric Elements */}
      {/* Top-left corner - Line box (half rectangle outline) */}
      <div className="hidden md:block absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 border-[8px] md:border-[12px] border-blue-200/50 rounded-br-[80px] md:rounded-br-[120px]"></div>
      
      {/* Bottom-right corner - Filled box */}
      <div className="hidden md:block absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tl from-blue-200/40 to-blue-100/20 rounded-tl-[100px] md:rounded-tl-[140px]"></div>
      
      {/* Additional subtle decorative elements */}
      <div className="hidden lg:block absolute top-32 right-32 w-48 h-48 border-[6px] border-blue-100/40 rounded-full"></div>
      <div className="hidden lg:block absolute bottom-40 left-40 w-40 h-40 bg-blue-100/30 rounded-2xl rotate-12"></div>

      {/* Centered Login Container */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
          <Image src="/assets/logo.png" alt="NoteSwift Logo" width={64} height={64} className="sm:w-[72px] sm:h-[72px] rounded-3xl mb-3" />
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Teacher's Portal</h1>
            <p className="text-xs sm:text-sm text-gray-500 px-2">The fastest, simplest, and most secure way to manage your teaching portal.</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200">
        <CardHeader className="text-center space-y-2 sm:space-y-3 pb-2 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Sign in to your account</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-500">
            Sign in to access your NoteSwift teaching dashboard. 
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <span className="text-red-500">⚠</span> {error}
                </p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full font-semibold text-sm sm:text-base h-11 sm:h-12 bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 sm:mt-6 text-center">
            <Button 
              type="button"
              variant="ghost"
              className="text-sm text-gray-600 hover:text-blue-600"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign up link */}
      <div className="mt-4 sm:mt-6 text-center px-4">
        <p className="text-xs sm:text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="font-semibold text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>

      {/* Copyright Watermark */}
      <div className="mt-6 sm:mt-8 text-center px-4">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Note Swift. Developed by{" "}
          <a
            href="https://codelitsstudio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-600 hover:text-yellow-600 transition-colors duration-200"
          >
            Codelits Studio
          </a>
        </p>
      </div>
      </div>
    </main>
  );
}
