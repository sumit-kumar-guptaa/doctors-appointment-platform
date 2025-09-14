"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, Star, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import DevCheckout from "./dev-checkout";
import Link from "next/link";

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 25,
    credits: 10,
    description: "Perfect for occasional consultations",
    features: [
      "10 consultation credits",
      "Basic video calling",
      "Appointment scheduling",
      "24/7 support",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional", 
    price: 75,
    credits: 35,
    description: "Best value for regular healthcare needs",
    features: [
      "35 consultation credits",
      "HD video calling",
      "Priority appointment booking",
      "Health records access",
      "Prescription management",
      "Dedicated support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 150,
    credits: 80,
    description: "Comprehensive healthcare solution",
    features: [
      "80 consultation credits",
      "4K video calling",
      "Instant appointment booking",
      "Complete health dashboard",
      "Advanced prescription tools",
      "Family account management",
      "Priority support",
    ],
    popular: false,
  },
];

const Pricing = () => {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = async (plan) => {
    if (!isSignedIn) {
      window.location.href = `/sign-up?plan=${plan.id}`;
      return;
    }

    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (newBalance) => {
    setShowCheckout(false);
    setSelectedPlan(null);
    // Refresh the page to update credits display
    window.location.reload();
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  if (showCheckout && selectedPlan) {
    return (
      <DevCheckout
        planType={selectedPlan.name}
        credits={selectedPlan.credits}
        amount={selectedPlan.price}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4">
      {pricingPlans.map((plan, index) => (
        <Card 
          key={index}
          className={`relative border-purple-900/30 shadow-xl bg-gradient-to-b from-purple-950/30 to-transparent hover:shadow-2xl transition-all duration-300 w-full max-w-sm mx-auto lg:max-w-none ${
            plan.popular ? 'ring-2 ring-orange-400 scale-105 lg:scale-110' : 'hover:scale-102'
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 text-xs sm:px-4 sm:py-1 sm:text-sm shadow-lg">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4 pt-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {plan.name}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400">
                ${plan.price}
              </div>
            </div>
            <CardDescription className="text-muted-foreground mt-2 text-sm sm:text-base px-2">
              {plan.description}
            </CardDescription>
            <div className="mt-4 p-3 sm:p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">
                {plan.credits} Credits
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                Each consultation = 2 credits
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 px-4 sm:px-6 pb-6">
            <ul className="space-y-2 sm:space-y-3 mb-6 min-h-[200px] sm:min-h-[220px]">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className={`w-full h-10 sm:h-12 text-sm sm:text-base font-medium transition-all duration-300 ${
                plan.popular 
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl' 
                  : 'bg-purple-700 hover:bg-purple-800'
              }`}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase ${plan.credits} Credits`
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Pricing;
