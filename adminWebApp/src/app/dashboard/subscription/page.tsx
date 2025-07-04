
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Crown, Sparkles, Building, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Basic",
    description: "For individuals and small teams just getting started.",
    price: { monthly: 0, yearly: 0 },
    priceIds: {
      paddle_monthly: null,
      paddle_yearly: null,
      esewa_code: "NOTESWIFT_BASIC",
    },
    features: [
      "Core Dashboard Access",
      "Content Management",
      "User Management",
      "Basic Reporting",
    ],
    icon: Sparkles,
    highlight: false,
  },
  {
    name: "Pro",
    description: "For growing businesses that need more power and insights.",
    price: { monthly: 19, yearly: 193.80 },
    priceIds: {
      paddle_monthly: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID,
      paddle_yearly: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID,
      esewa_code: "NOTESWIFT_PRO",
    },
    features: [
      "Everything in Basic",
      "AI-Powered Insights",
      "AI Task Suggestions",
      "Advanced Reporting",
      "Priority Support",
    ],
    icon: Crown,
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations requiring advanced security and support.",
    price: { monthly: 49, yearly: 499.80 },
    priceIds: {
      paddle_monthly: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_MONTHLY_PRICE_ID,
      paddle_yearly: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_YEARLY_PRICE_ID,
      esewa_code: "NOTESWIFT_ENTERPRISE",
    },
    features: [
      "Everything in Pro",
      "Audit Logs",
      "Feature Flags",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    icon: Building,
    highlight: false,
  },
];

type Plan = (typeof plans)[0];

const USD_TO_NPR_RATE = 133;

export default function SubscriptionPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [paymentRegion, setPaymentRegion] = useState("global");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isLocalPaymentDialogOpen, setIsLocalPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const handleUpgradeClickLocal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsLocalPaymentDialogOpen(true);
  };

  const handleEsewaPay = () => {
    setIsProcessing("eSewa");
    toast({ title: "eSewa Payment", description: "eSewa integration coming soon." });
    setTimeout(() => {
        setIsLocalPaymentDialogOpen(false);
        setIsProcessing(null);
    }, 1000);
  };

  const handleKhaltiPay = () => {
    setIsProcessing("Khalti");
    toast({ title: "Khalti Payment", description: "Khalti integration coming soon." });
    setTimeout(() => {
        setIsLocalPaymentDialogOpen(false);
        setIsProcessing(null);
    }, 1000);
  }

  const handleImePay = () => {
    setIsProcessing("IMEPay");
    toast({ title: "IME Pay Payment", description: "IME Pay integration coming soon." });
     setTimeout(() => {
        setIsLocalPaymentDialogOpen(false);
        setIsProcessing(null);
    }, 1000);
  }

  const getPriceDetails = (plan: Plan) => {
    const priceUsd = isYearly ? plan.price.yearly : plan.price.monthly;
    if (paymentRegion === "global") {
      return {
        price: priceUsd,
        currency: "$",
        period: isYearly ? "/year" : "/month",
      };
    } else {
      return {
        price: Math.round(priceUsd * USD_TO_NPR_RATE),
        currency: "Rs. ",
        period: isYearly ? "/year" : "/month",
      };
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">Choose the plan that's right for you.</p>
      </div>

      <Tabs defaultValue="global" onValueChange={setPaymentRegion} className="w-full max-w-sm mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">Pay Globally (USD)</TabsTrigger>
          <TabsTrigger value="local">Pay Locally (NPR)</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-center items-center gap-4">
        <Label htmlFor="billing-cycle">Monthly</Label>
        <Switch id="billing-cycle" checked={isYearly} onCheckedChange={setIsYearly} />
        <Label htmlFor="billing-cycle">Yearly</Label>
        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">Save 15%</span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const { price, currency, period } = getPriceDetails(plan);
          const paddlePriceId = isYearly ? plan.priceIds.paddle_yearly : plan.priceIds.paddle_monthly;
          const isLoading = isProcessing === plan.name;
          return (
            <Card key={plan.name} className={cn("flex flex-col shadow-md", plan.highlight && "border-2 border-primary shadow-lg")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <plan.icon className={cn("w-8 h-8", plan.highlight ? "text-primary" : "text-muted-foreground")} />
                  <CardTitle className="text-3xl font-headline">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{currency}{price.toLocaleString()}</span>
                  <span className="text-muted-foreground">{period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.name === "Basic" ? (
                  <Button className="w-full" disabled>Current Plan</Button>
                ) : paymentRegion === "global" ? (
                  <Button asChild className="w-full" disabled={!paddlePriceId}>
                    <Link href={`https://pay.paddle.com/checkout?items[${paddlePriceId}]=1`}>Upgrade to {plan.name}</Link>
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleUpgradeClickLocal(plan)} disabled={isLoading}>
                    Upgrade to {plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isLocalPaymentDialogOpen} onOpenChange={setIsLocalPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Local Payment Method</DialogTitle>
            <DialogDescription>
              You are upgrading to the <span className="font-bold">{selectedPlan?.name}</span> plan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={handleEsewaPay} disabled={isProcessing !== null}>
              {isProcessing === "eSewa" && <Loader2 className="animate-spin" />}
              Pay with eSewa
            </Button>
            <Button onClick={handleKhaltiPay} disabled={isProcessing !== null}>
              {isProcessing === "Khalti" && <Loader2 className="animate-spin" />}
              Pay with Khalti
            </Button>
             <Button onClick={handleImePay} disabled={isProcessing !== null}>
              {isProcessing === "IMEPay" && <Loader2 className="animate-spin" />}
              Pay with IME Pay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
