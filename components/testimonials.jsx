"use client";

import React, { useState } from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { IconStar, IconQuote, IconChevronLeft, IconChevronRight, IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";

export function PatientTestimonials() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Reviews", count: medicalTestimonials.length },
    { id: "patient", label: "Patients", count: medicalTestimonials.filter(t => t.type === "patient").length },
    { id: "doctor", label: "Doctors", count: medicalTestimonials.filter(t => t.type === "doctor").length },
  ];

  const filteredTestimonials = selectedCategory === "all" 
    ? medicalTestimonials 
    : medicalTestimonials.filter(t => t.type === selectedCategory);

  const toggleAnimation = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="py-24 bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 dark:from-slate-950 dark:via-purple-950/20 dark:to-orange-950/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-200/20 dark:bg-orange-800/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge 
            variant="outline" 
            className="bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/30 dark:to-orange-900/30 border-purple-300 dark:border-purple-700 px-6 py-2 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
          >
            ⭐ Trusted by 50,000+ Healthcare Professionals & Patients
          </Badge>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-title">Patient Success Stories</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            Discover how MediMeet transforms healthcare experiences through real stories from our community of patients and medical professionals
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white"
                    : "hover:bg-purple-100 dark:hover:bg-purple-900/30"
                }`}
              >
                {category.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Animation Controls */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAnimation}
              className="flex items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              {isPaused ? <IconPlayerPlay size={16} /> : <IconPlayerPause size={16} />}
              {isPaused ? "Resume" : "Pause"} Animation
            </Button>
            <p className="text-sm text-muted-foreground">
              Showing {filteredTestimonials.length} reviews
            </p>
          </div>
        </div>
        
        {/* Interactive Moving Cards */}
        <div className="h-[50rem] rounded-xl flex flex-col antialiased items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={filteredTestimonials}
            direction="right"
            speed="slow"
            pauseOnHover={true}
            className={isPaused ? "[animation-play-state:paused]" : ""}
          />
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
            <p className="text-sm text-muted-foreground">Happy Patients</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">2K+</div>
            <p className="text-sm text-muted-foreground">Verified Doctors</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">4.9★</div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">99%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-medium"
          >
            Join Our Community
          </Button>
        </div>
      </div>
    </div>
  );
}

const medicalTestimonials = [
  {
    quote: "MediMeet transformed how I deliver patient care. The platform's intuitive design and secure video calls allow me to provide quality consultations remotely. My patient satisfaction rates have increased by 40%.",
    name: "Dr. Sarah Mitchell",
    title: "Cardiologist • Johns Hopkins Hospital",
    type: "doctor",
    rating: 5,
    specialty: "Cardiology"
  },
  {
    quote: "As a working mother, finding time for medical appointments was always challenging. MediMeet's flexible scheduling and video consultations have been a game-changer for my family's healthcare needs.",
    name: "Emily Rodriguez",
    title: "Patient • Software Engineer & Mother of 2",
    type: "patient",
    rating: 5,
    condition: "Family Medicine"
  },
  {
    quote: "The telemedicine capabilities on MediMeet allow me to reach patients in rural areas who previously had limited access to specialized care. It's revolutionizing healthcare accessibility.",
    name: "Dr. Michael Chen",
    title: "Neurologist • Mayo Clinic",
    type: "doctor",
    rating: 5,
    specialty: "Neurology"
  },
  {
    quote: "I was skeptical about online consultations, but my dermatologist on MediMeet was incredibly thorough. The high-quality video and secure file sharing made the diagnosis process seamless.",
    name: "James Thompson",
    title: "Patient • Marketing Director",
    type: "patient",
    rating: 5,
    condition: "Dermatology"
  },
  {
    quote: "MediMeet's comprehensive platform manages everything from appointment scheduling to prescription delivery. It's streamlined my practice and improved patient outcomes significantly.",
    name: "Dr. Rachel Park",
    title: "Family Medicine • Stanford Health",
    type: "doctor",
    rating: 5,
    specialty: "Family Medicine"
  },
  {
    quote: "The mental health support I received through MediMeet was exceptional. The secure, private environment and qualified psychiatrists helped me through a difficult period in my life.",
    name: "Maria Santos",
    title: "Patient • Teacher",
    type: "patient",
    rating: 5,
    condition: "Mental Health"
  },
  {
    quote: "Being able to conduct follow-up appointments virtually has improved my patients' adherence to treatment plans. MediMeet's integrated health records make continuity of care effortless.",
    name: "Dr. David Wilson",
    title: "Orthopedic Surgeon • Cleveland Clinic",
    type: "doctor",
    rating: 5,
    specialty: "Orthopedics"
  },
  {
    quote: "Living in a small town, access to specialists was always an issue. MediMeet connected me with a top endocrinologist who has been managing my diabetes excellently through virtual visits.",
    name: "Robert Johnson",
    title: "Patient • Retired Teacher",
    type: "patient",
    rating: 5,
    condition: "Endocrinology"
  },
  {
    quote: "The platform's security features and HIPAA compliance give me confidence in discussing sensitive patient information. MediMeet has become an essential tool in my psychiatric practice.",
    name: "Dr. Lisa Wang",
    title: "Psychiatrist • UCSF Health",
    type: "doctor",
    rating: 5,
    specialty: "Psychiatry"
  },
  {
    quote: "As a college student, MediMeet's affordable credit system and flexible scheduling fit perfectly with my busy academic life. I've had excellent experiences with multiple specialists.",
    name: "Alex Kumar",
    title: "Patient • Medical Student",
    type: "patient",
    rating: 5,
    condition: "Preventive Care"
  },
];