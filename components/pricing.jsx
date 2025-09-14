"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, Star } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for trying out our platform",
    credits: "2",
    features: [
      "2 consultation credits",
      "Basic video consultations",
      "Email support",
      "Access to general practitioners",
    ],
    buttonText: "Get Started Free",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Standard",
    price: "$29",
    originalPrice: "$40",
    description: "Great for regular healthcare needs",
    credits: "10",
    features: [
      "10 consultation credits/month",
      "HD video consultations",
      "Priority email support",
      "Access to all specialists",
      "Appointment history & records",
      "24/7 platform access",
    ],
    buttonText: "Choose Standard",
    href: "/sign-up?plan=standard",
    popular: true,
  },
  {
    name: "Premium",
    price: "$59",
    originalPrice: "$80", 
    description: "Best value for families and frequent users",
    credits: "24",
    features: [
      "24 consultation credits/month",
      "4K video consultations",
      "24/7 priority support",
      "Access to premium specialists",
      "Advanced health analytics",
      "Family account management",
      "Prescription management",
      "Health goal tracking",
    ],
    buttonText: "Choose Premium",
    href: "/sign-up?plan=premium",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {pricingPlans.map((plan, index) => (
        <Card 
          key={index}
          className={`relative border-purple-900/30 shadow-lg bg-gradient-to-b from-purple-950/30 to-transparent hover:scale-105 transition-transform duration-300 ${
            plan.popular ? 'ring-2 ring-orange-400' : ''
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">
              {plan.name}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="text-3xl font-bold text-emerald-400">
                {plan.price}
              </div>
              {plan.originalPrice && (
                <div className="text-lg text-muted-foreground line-through">
                  {plan.originalPrice}
                </div>
              )}
              {plan.price !== "Free" && (
                <div className="text-muted-foreground">/month</div>
              )}
            </div>
            <CardDescription className="text-muted-foreground mt-2">
              {plan.description}
            </CardDescription>
            <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {plan.credits} Credits
              </div>
              <div className="text-sm text-muted-foreground">
                Each consultation = 2 credits
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            <Link href={plan.href} className="block">
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-purple-700 hover:bg-purple-800'
                }`}
              >
                {plan.buttonText}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Pricing;
