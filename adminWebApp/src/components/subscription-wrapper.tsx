
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';

// For demonstration purposes, we define a simple hierarchy of plans.
// In a real app, this would come from your user's subscription status.
const plans = ["Basic", "Pro", "Enterprise"];

interface SubscriptionWrapperProps {
  children: React.ReactNode;
  requiredPlan: "Basic" | "Pro" | "Enterprise";
}

export function SubscriptionWrapper({ children, requiredPlan }: SubscriptionWrapperProps) {
  // We'll mock the user's current plan. In a real app, you'd fetch this.
  const [currentPlan] = useState("Basic"); 

  const currentUserPlanIndex = plans.indexOf(currentPlan);
  const requiredPlanIndex = plans.indexOf(requiredPlan);

  const hasAccess = currentUserPlanIndex >= requiredPlanIndex;

  if (hasAccess) {
    return <>{children}</>;
  }

  // If the user doesn't have access, show the upgrade prompt.
  return (
    <div className="flex items-center justify-center h-full w-full">
        <Card className="w-full max-w-md text-center shadow-xl">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">Upgrade Required</CardTitle>
                <CardDescription>
                    This feature is available on the <span className="font-bold text-primary">{requiredPlan}</span> plan.
                    You are currently on the <span className="font-bold">{currentPlan}</span> plan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">
                    Please upgrade your subscription to unlock this feature and more.
                </p>
                <Button asChild className="w-full">
                    <Link href="/dashboard/subscription">
                        View Subscription Plans <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
