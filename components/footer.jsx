"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  IconMail, 
  IconPhone, 
  IconMapPin, 
  IconBrandTwitter, 
  IconBrandLinkedin, 
  IconBrandInstagram,
  IconBrandFacebook,
  IconStethoscope,
  IconCalendar,
  IconUsers,
  IconShield
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function InteractiveFooter() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    const email = e.target.email.value;
    console.log("Newsletter subscription:", email);
    // You can add your newsletter subscription logic here
    alert("Thank you for subscribing to our newsletter!");
    e.target.reset();
  };

  return (
    <footer className="bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="AARAGYA Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg"
              />
              <span className="text-xl font-bold gradient-title">AARAGYA</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting patients with healthcare professionals through secure, convenient online consultations. 
              Your health, our priority.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-blue-800/30 hover:text-teal-400 transition-colors"
                asChild
              >
                <a href="#" aria-label="Facebook">
                  <IconBrandFacebook size={20} />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-blue-800/30 hover:text-teal-400 transition-colors"
                asChild
              >
                <a href="#" aria-label="Twitter">
                  <IconBrandTwitter size={20} />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-blue-800/30 hover:text-teal-400 transition-colors"
                asChild
              >
                <a href="#" aria-label="LinkedIn">
                  <IconBrandLinkedin size={20} />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-blue-800/30 hover:text-teal-400 transition-colors"
                asChild
              >
                <a href="#" aria-label="Instagram">
                  <IconBrandInstagram size={20} />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/doctors" className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors">
                  <IconStethoscope size={16} />
                  <span>Find Doctors</span>
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors">
                  <IconCalendar size={16} />
                  <span>Book Appointment</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors">
                  <IconUsers size={16} />
                  <span>Pricing Plans</span>
                </Link>
              </li>
              <li>
                <Link href="/doctor/verification" className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors">
                  <IconShield size={16} />
                  <span>Doctor Verification</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Stay Updated</h3>
            <p className="text-gray-300 text-sm">
              Subscribe to our newsletter for health tips and updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-teal-400"
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <IconMail size={16} className="text-teal-400" />
              <span>contact@AARAGYA.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconPhone size={16} className="text-teal-400" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconMapPin size={16} className="text-teal-400" />
              <span>123 Healthcare Ave, Medical City</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 AARAGYA. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-teal-400 transition-colors">
              Accessibility
            </a>
            <a href="#" className="hover:text-teal-400 transition-colors">
              Security
            </a>
            <a href="#" className="hover:text-teal-400 transition-colors">
              HIPAA Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}