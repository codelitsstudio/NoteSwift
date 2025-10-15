'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('teacherToken');

    if (!token) {
      router.push('/login');
      return;
    }

    // Get email from localStorage or decode from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.email || '');
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Application Under Review</h1>
          <p className="text-gray-600 mt-2">
            Your teacher application has been submitted successfully
          </p>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Onboarding Complete!
            </CardTitle>
            <CardDescription>
              Thank you for completing your profile. Our team will review your application within 24-48 hours.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* What happens next */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What happens next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Our team reviews your qualifications and documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email notification once approved</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Approved teachers get full access to the dashboard</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Need help?</p>
                  <p className="text-sm text-blue-700">
                    Contact our support team at{' '}
                    <a href="mailto:support@noteswift.com" className="underline hover:no-underline">
                      support@noteswift.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>

              <p className="text-xs text-center text-gray-500">
                You can check back later or we'll notify you via email when your application is approved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}