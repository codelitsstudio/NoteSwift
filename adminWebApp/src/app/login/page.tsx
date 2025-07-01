
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { handleAdminLogin, handleSendOtp } from "@/app/actions";

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

  const loginResult = await handleAdminLogin(username, password);

  if (loginResult.success) {
    const result = await handleSendOtp();
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
          <CardTitle className="text-3xl font-bold font-headline">NoteSwift Admin</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="eg: codelits_studio"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full font-semibold text-base py-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
