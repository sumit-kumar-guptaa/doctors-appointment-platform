"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "./ui/sidebar";
import {
  IconCalendar,
  IconDashboard,
  IconStethoscope,
  IconUser,
  IconSettings,
  IconLogout,
  IconCreditCard,
  IconUsers,
  IconShield,
  IconClipboardList,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { MedicalHistorySidebar } from "./medical-history-sidebar";

export function DoctorsSidebar({ children }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [medicalHistoryOpen, setMedicalHistoryOpen] = useState(false);

  // Define links based on user role (you can pass this as props or get from context)
  const getLinksForRole = (role) => {
    const commonLinks = [
      {
        label: "Dashboard",
        href: "/",
        icon: (
          <IconDashboard className="h-5 w-5 shrink-0 text-blue-600 dark:text-teal-400" />
        ),
      },
      {
        label: "🚨 Emergency",
        href: "/emergency",
        icon: (
          <IconAlertTriangle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400 animate-pulse" />
        ),
        className: "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-r-md px-3 py-2 my-1",
      },
    ];

    if (role === "PATIENT") {
      return [
        ...commonLinks,
        {
          label: "Find Doctors",
          href: "/doctors",
          icon: (
            <IconStethoscope className="h-5 w-5 shrink-0 text-blue-600 dark:text-teal-400" />
          ),
        },
        {
          label: "My Appointments",
          href: "/appointments",
          icon: (
            <IconCalendar className="h-5 w-5 shrink-0 text-blue-600 dark:text-teal-400" />
          ),
        },
        {
          label: "Medical History",
          href: "#",
          onClick: () => setMedicalHistoryOpen(true),
          icon: (
            <IconClipboardList className="h-5 w-5 shrink-0 text-blue-600 dark:text-teal-400" />
          ),
        },
        {
          label: "Credits & Pricing",
          href: "/pricing",
          icon: (
            <IconCreditCard className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
          ),
        },
      ];
    }

    if (role === "DOCTOR") {
      return [
        ...commonLinks,
        {
          label: "Doctor Dashboard",
          href: "/doctor",
          icon: (
            <IconStethoscope className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
          ),
        },
        {
          label: "My Appointments",
          href: "/doctor",
          icon: (
            <IconCalendar className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
          ),
        },
        {
          label: "Verification",
          href: "/doctor/verification",
          icon: (
            <IconShield className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
          ),
        },
      ];
    }

    if (role === "ADMIN") {
      return [
        ...commonLinks,
        {
          label: "Admin Panel",
          href: "/admin",
          icon: (
            <IconShield className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
          ),
        },
        {
          label: "Manage Doctors",
          href: "/admin/doctors",
          icon: (
            <IconUsers className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
          ),
        },
        {
          label: "Payouts",
          href: "/admin/payouts",
          icon: (
            <IconCreditCard className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
          ),
        },
      ];
    }

    return [
      ...commonLinks,
      {
        label: "Complete Profile",
        href: "/onboarding",
        icon: (
          <IconUser className="h-5 w-5 shrink-0 text-purple-600 dark:text-orange-400" />
        ),
      },
    ];
  };

  const links = getLinksForRole(user?.publicMetadata?.role || "UNASSIGNED");

  return (
    <SidebarProvider>
      <div
        className={cn(
          "mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden bg-background md:flex-row",
          "min-h-screen"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            <div className="border-t border-purple-200 dark:border-purple-800 pt-4">
              <div className="flex items-center gap-2 px-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
                {open && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {user?.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.publicMetadata?.role || "User"}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <div className="flex flex-1">
          <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-purple-200 dark:border-purple-800 bg-background p-2 md:p-6">
            {children}
          </div>
        </div>
      </div>
      
      {/* Medical History Sliding Window */}
      <MedicalHistorySidebar 
        isOpen={medicalHistoryOpen} 
        onClose={() => setMedicalHistoryOpen(false)} 
      />
    </SidebarProvider>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground"
    >
      <Image
        src="/logo.png"
        alt="AARAGYA Logo"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-lg"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-xl gradient-title"
      >
        AARAGYA
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground"
    >
      <Image
        src="/logo.png"
        alt="AARAGYA Logo"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-lg"
      />
    </Link>
  );
};