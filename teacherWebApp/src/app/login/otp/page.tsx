"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookMarked, Loader2, ShieldCheck, Clock, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function OtpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const isVerified = localStorage.getItem("isPasswordVerified");
    if (isVerified !== "true") {
      router.replace("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const resp = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ otp }) });
    const result = await resp.json();

    if (result.success) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.removeItem("isPasswordVerified");
      toast({
        title: "Authentication Successful",
        description: "Welcome to the dashboard!",
      });
      router.push("/dashboard");
    } else {
      setError(result.error || "Invalid code. Please try again.");
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: result.error || "The code you entered is incorrect.",
      });
    }
    setIsLoading(false);
  };

  const onResend = async () => {
    setIsResending(true);
    const otpResp = await fetch("/api/auth/send-otp", { method: "POST" });
    const result = await otpResp.json();
    if (result.success) {
      toast({
        title: "Code Resent",
        description: "A new one-time code has been sent.",
      });
    } else {
       toast({
        variant: "destructive",
        title: "Failed to Resend",
        description: result.error,
      });
    }
    setIsResending(false);
  }

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

      {/* Centered OTP Container */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
          <Image src="/assets/logo.png" alt="NoteSwift Logo" width={64} height={64} className="sm:w-[72px] sm:h-[72px] rounded-3xl mb-3" />
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Verify Your Identity</h1>
            <p className="text-xs sm:text-sm text-gray-500 px-2">Enter the verification code sent to your email</p>
          </div>
        </div>

        {/* OTP Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200">
        <CardHeader className="text-center space-y-2 sm:space-y-3 pb-2 px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 mx-auto rounded-full bg-blue-500 px-3 sm:px-4 py-1.5 text-white text-xs font-medium shadow-sm">
            <Clock className="h-3.5 w-3.5" /> 
            <span className="text-xs">Expires in 10 minutes</span>
          </div>
          <CardDescription className="text-xs sm:text-sm text-gray-500 px-2">
            We've sent a 6-digit code to your registered email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium text-gray-700">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={6}
                className="h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold tracking-widest border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Enter the 6-digit code from your email
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-red-600 flex items-center gap-2">
                  <span className="text-red-500">⚠</span> {error}
                </p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full font-semibold text-sm sm:text-base h-11 sm:h-12 bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-200" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />}
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-10 sm:h-11 text-sm border-2 hover:bg-gray-50 transition-colors" 
              onClick={onResend} 
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending New Code...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Code
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 sm:mt-6 text-center">
            <Button 
              type="button"
              variant="ghost"
              className="text-sm text-gray-600 hover:text-blue-600"
              onClick={() => router.back()}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security info */}
      <div className="mt-4 sm:mt-6 text-center px-4">
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span>Secure</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            <span>One-time use</span>
          </div>
        </div>
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
