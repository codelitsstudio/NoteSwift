'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function VerifyEmailContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  // Remove redirect state and effect
  
  const email = searchParams.get('email') || '';

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const result = await response.json();

      if (!result.success || result.error) {
        setError(result.message || 'Verification failed');
        return;
      }

      // Store token and teacher info
  localStorage.setItem('teacherToken', result.data.token);
  // Ensure teacherId is NOT stored anywhere
  localStorage.removeItem('teacherId');

      toast({
        title: 'Email Verified!',
        description: 'Your email has been verified successfully. Redirecting to onboarding...',
      });

      // Wait 1 second so toast is visible
      setTimeout(() => {
        router.replace('/onboarding');
      }, 1000);

    } catch (error: any) {
      console.error('Verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.message || 'Failed to resend code');
        return;
      }

      toast({
        title: 'Code Sent',
        description: 'A new verification code has been sent to your email.',
      });

      // Reset timer
      setTimeLeft(600);
      setVerificationCode('');

    } catch (error: any) {
      console.error('Resend error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Elements */}
      <div className="hidden md:block absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 border-[8px] md:border-[12px] border-blue-200/50 rounded-br-[80px] md:rounded-br-[120px]"></div>
      <div className="hidden md:block absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tl from-blue-200/40 to-blue-100/20 rounded-tl-[100px] md:rounded-tl-[140px]"></div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/assets/logo.png" 
              alt="NoteSwift Logo" 
              width={64} 
              height={64} 
              className="rounded-3xl"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to
          </p>
          <p className="font-medium text-blue-600">{email}</p>
        </div>

        {/* Verification Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Enter Verification Code
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Code expires in: <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Email
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendCode}
                  disabled={isResending || timeLeft > 0}
                  className="p-0 h-auto"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : timeLeft > 0 ? (
                    `Resend in ${formatTime(timeLeft)}`
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>

              <div className="text-center border-t pt-4">
                <p className="text-sm text-gray-600">
                  Wrong email address?{' '}
                  <Link href="/register" className="text-blue-600 hover:underline">
                    Go back to registration
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Need help?{' '}
            <Link href="/support" className="font-medium text-blue-600 hover:text-blue-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}