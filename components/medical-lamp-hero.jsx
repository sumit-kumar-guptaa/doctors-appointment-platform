"use client";
import React from "react";
import { motion } from "motion/react";
import { LampContainer } from "./ui/lamp";
import { FlipWords } from "./ui/flip-words";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { ArrowRight, Stethoscope, Users, Clock, Shield } from "lucide-react";

export function MedicalLampHero() {
  const healthcareWords = ["Revolutionary", "Personalized", "Accessible", "Advanced", "Innovative", "Professional"];
  const careWords = ["Expert Care", "Quality Treatment", "Medical Excellence", "Health Solutions", "Wellness Support"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <LampContainer>
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
        >
          {/* Professional Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-3"
          >
            <Badge
              variant="outline"
              className="bg-purple-900/30 border-purple-700/30 px-4 py-2 text-orange-400 text-xs font-medium backdrop-blur-sm"
            >
              🏥 Trusted by 50,000+ Patients & 2,000+ Doctors
            </Badge>
          </motion.div>

          {/* Main Heading with Flip Words */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="bg-gradient-to-br from-purple-300 via-white to-orange-300 py-2 bg-clip-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-transparent leading-tight">
              Transform Healthcare
              <br />
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                With <FlipWords words={careWords} className="text-orange-400 dark:text-orange-300" />
              </span>
            </h1>
            
            <div className="mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
              <span className="text-purple-300">Experience </span>
              <FlipWords words={healthcareWords} className="text-purple-400 dark:text-purple-300 font-bold" />
              <span className="text-purple-300"> Healthcare</span>
            </div>
          </div>

          {/* Professional Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed"
          >
            Connect with verified medical specialists through secure video consultations. 
            Get professional healthcare from the comfort of your home, 24/7 availability, 
            HIPAA-compliant platform.
          </motion.p>

          {/* Professional Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-xs sm:max-w-sm md:max-w-xl lg:max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-purple-400">50K+</div>
              <div className="text-xs text-gray-400">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-orange-400">2K+</div>
              <div className="text-xs text-gray-400">Expert Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-purple-400">24/7</div>
              <div className="text-xs text-gray-400">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-orange-400">4.9★</div>
              <div className="text-xs text-gray-400">Rating</div>
            </div>
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center"
          >
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold group w-full sm:w-auto"
            >
              <Link href="/sign-up" className="flex items-center justify-center">
                <span className="hidden sm:inline">Start Your Healthcare Journey</span>
                <span className="sm:hidden">Get Started</span>
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20 px-4 sm:px-6 py-2 text-xs sm:text-sm backdrop-blur-sm w-full sm:w-auto"
            >
              <Link href="/doctors" className="flex items-center justify-center">Find Specialists</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs text-gray-400"
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <Shield className="h-3 w-3 text-green-400" />
              <span className="text-xs">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Stethoscope className="h-3 w-3 text-purple-400" />
              <span className="text-xs">Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock className="h-3 w-3 text-orange-400" />
              <span className="text-xs">Instant Consultations</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="h-3 w-3 text-blue-400" />
              <span className="text-xs">50+ Specialties</span>
            </div>
          </motion.div>
        </motion.div>
      </LampContainer>
    </div>
  );
}