
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { handleVerifyOtp, handleSendOtp } from "@/app/actions";

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

    const result = await handleVerifyOtp({ otp });

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
    const result = await handleSendOtp();
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
                                       <img
      src="/assets/logo.jpg"
      alt="NoteSwift Logo"
      className="h-16 w-16 object-contain"
    />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Enter Verification Code</CardTitle>
          <CardDescription>A 6-digit code was sent to the secret email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full font-semibold text-base py-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
            <Button type="button" variant="link" className="w-full" onClick={onResend} disabled={isResending}>
              {isResending ? "Sending..." : "Didn't get a code? Resend"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
