"use client";

import React from "react";
import { HoverEffect } from "./ui/card-hover-effect";
import { Badge } from "./ui/badge";

export function HowItWorks() {
  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-purple-50/20 to-orange-50/20 dark:from-slate-950 dark:via-purple-950/10 dark:to-orange-950/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <Badge 
            variant="outline" 
            className="bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/30 dark:to-orange-900/30 border-purple-300 dark:border-purple-700 px-4 sm:px-6 py-2 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4 sm:mb-6"
          >
            ⚡ Revolutionary Healthcare Experience
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="gradient-title">The Future of Healthcare</span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-normal">
              Delivered Today
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Experience healthcare reimagined through cutting-edge technology, personalized care, and seamless digital experiences. 
            From 24/7 emergency medical services to AI-powered medical report diagnosis - discover how we're transforming healthcare delivery.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <HoverEffect items={howItWorksSteps} />
        </div>

        {/* Additional Info */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 gradient-title">
              Why Choose Our Revolutionary Platform?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div className="space-y-3 p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <div className="text-2xl sm:text-3xl">🚨</div>
                <h4 className="font-semibold text-sm sm:text-base">Emergency Services</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Instant connection to emergency doctors for critical situations</p>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <div className="text-2xl sm:text-3xl">🧠</div>
                <h4 className="font-semibold text-sm sm:text-base">AI Medical Diagnosis</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Upload medical reports for AI-powered analysis and disease detection</p>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <div className="text-2xl sm:text-3xl">💎</div>
                <h4 className="font-semibold text-sm sm:text-base">AI-Powered Care</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Machine learning for personalized care recommendations</p>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <div className="text-2xl sm:text-3xl">⏰</div>
                <h4 className="font-semibold text-sm sm:text-base">24/7 Excellence</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Round-the-clock access to premium healthcare</p>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="mt-8 pt-6 border-t border-purple-200/30 dark:border-purple-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Happy Patients</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">2K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Verified Doctors</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">98.9%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Availability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const howItWorksSteps = [
  {
    title: "Smart Health Onboarding",
    description: "Complete your intelligent health profile in under 3 minutes. Our AI-powered system analyzes your medical history, current symptoms, and health goals to create a personalized healthcare roadmap tailored specifically for you.",
    link: "/sign-up",
    icon: "🧬",
    step: "Step 1",
    category: "Setup"
  },
  {
    title: "AI-Powered Doctor Matching",
    description: "Our advanced matching algorithm connects you with the most suitable specialists based on your health profile, location preferences, insurance coverage, and patient reviews. No more guessing - find your perfect healthcare match.",
    link: "/doctors",
    icon: "🔬",
    step: "Step 2",
    category: "Discovery"
  },
  {
    title: "Intelligent Scheduling",
    description: "Book appointments using our smart calendar that considers doctor availability, your time zone, urgency level, and preferred consultation type. Automatic reminders and calendar integration included.",
    link: "/appointments",
    icon: "📅",
    step: "Step 3",
    category: "Booking"
  },
  {
    title: "Next-Gen Telemedicine",
    description: "Experience healthcare reimagined with our cutting-edge consultation platform featuring HD video, real-time health data sharing, digital prescriptions, and instant lab result discussions - all HIPAA compliant.",
    link: "/video-call",
    icon: "📹",
    step: "Step 4",
    category: "Consultation"
  },
  {
    title: "Comprehensive Health Hub",
    description: "Access your complete digital health ecosystem - consultation history, prescription tracking, lab results, health insights, doctor recommendations, and personalized wellness plans all in one secure portal.",
    link: "/medical-history",
    icon: "📊",
    step: "Step 5",
    category: "Management"
  },
  {
    title: "Continuous Care Excellence",
    description: "Enjoy ongoing health support with automated follow-up reminders, health trend analysis, medication adherence tracking, and seamless care coordination between your healthcare team.",
    link: "/dashboard",
    icon: "💎",
    step: "Step 6",
    category: "Ongoing Care"
  },
];