import React from "react";
import { MedicalHistoryFAB } from "@/components/medical-history-fab";

const MainLayout = ({ children }) => {
  return (
    <div className="w-full">
      {children}
      <MedicalHistoryFAB />
    </div>
  );
};

export default MainLayout;
