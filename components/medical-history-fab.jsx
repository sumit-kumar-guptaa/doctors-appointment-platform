"use client";
import React, { useState } from "react";
import { IconClipboardList } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { MedicalHistorySidebar } from "./medical-history-sidebar";
import { useUser } from "@clerk/nextjs";

export function MedicalHistoryFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  // Only show for patients
  if (user?.publicMetadata?.role !== "PATIENT") {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
        title="Open Medical History"
      >
        <IconClipboardList className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
      </motion.button>

      {/* Medical History Sidebar */}
      <MedicalHistorySidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}