"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconClipboardList,
  IconHeartbeat,
  IconPill,
  IconCalendar,
  IconAlertTriangle,
  IconX,
  IconUser,
  IconStethoscope,
  IconReportMedical,
  IconAward,
  IconScan,
} from "@tabler/icons-react";
import MedicalReportDiagnosis from "./medical-report-diagnosis";
import EmergencyCallButton from "./emergency-call-button";
import { cn } from "@/lib/utils";

// Dummy medical history data
const MEDICAL_HISTORY_DATA = {
  personalInfo: {
    bloodType: "O+",
    height: "5'8\"",
    weight: "70 kg",
    emergencyContact: "+1-555-0123",
    dateOfBirth: "1990-05-15",
    allergies: ["Penicillin", "Shellfish", "Pollen", "Latex"],
    insuranceProvider: "HealthPlus Insurance",
    policyNumber: "HP-2024-789654",
    primaryPhysician: "Dr. Johnson (Cardiology)",
    bloodPressure: "135/85 mmHg",
    heartRate: "78 bpm",
    temperature: "98.6°F",
  },
  currentMedications: [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Johnson",
      startDate: "2024-01-15",
      condition: "Hypertension",
    },
    {
      id: 2,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Smith",
      startDate: "2024-03-10",
      condition: "Type 2 Diabetes",
    },
    {
      id: 3,
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      prescribedBy: "Dr. Wilson",
      startDate: "2024-02-01",
      condition: "Vitamin D Deficiency",
    },
  ],
  pastMedicalHistory: [
    {
      id: 1,
      condition: "Appendectomy",
      date: "2018-06-20",
      doctor: "Dr. Brown",
      hospital: "City General Hospital",
      notes: "Successful laparoscopic appendectomy. No complications. Recovery was smooth and patient was discharged after 2 days.",
      severity: "moderate",
      category: "Surgery",
    },
    {
      id: 2,
      condition: "Hypertension Diagnosis",
      date: "2024-01-15",
      doctor: "Dr. Johnson",
      hospital: "MediCare Clinic",
      notes: "Initial diagnosis after consistent high BP readings (150/95 mmHg). Started on ACE inhibitor. Lifestyle modifications recommended.",
      severity: "mild",
      category: "Cardiovascular",
    },
    {
      id: 3,
      condition: "Type 2 Diabetes",
      date: "2024-03-10",
      doctor: "Dr. Smith",
      hospital: "Diabetes Care Center",
      notes: "HbA1c level 7.2%. Fasting glucose 145 mg/dL. Started on Metformin. Dietary counseling and exercise program initiated.",
      severity: "moderate",
      category: "Endocrine",
    },
    {
      id: 4,
      condition: "Seasonal Allergies",
      date: "2020-04-15",
      doctor: "Dr. Wilson",
      hospital: "Allergy & Immunology Center",
      notes: "Positive skin test for grass pollen, ragweed, and dust mites. Prescribed antihistamines and nasal spray.",
      severity: "mild",
      category: "Allergy/Immunology",
    },
    {
      id: 5,
      condition: "Vitamin D Deficiency",
      date: "2024-02-01",
      doctor: "Dr. Wilson",
      hospital: "MediCare Clinic",
      notes: "Vitamin D level at 18 ng/mL (low). Started on D3 supplements 1000 IU daily. Follow-up in 3 months.",
      severity: "mild",
      category: "Nutritional",
    },
  ],
  recentAppointments: [
    {
      id: 1,
      date: "2024-12-01",
      doctor: "Dr. Johnson",
      specialty: "Cardiology",
      reason: "Hypertension Follow-up",
      status: "completed",
      notes: "BP well controlled. Continue current medication.",
    },
    {
      id: 2,
      date: "2024-11-15",
      doctor: "Dr. Smith",
      specialty: "Endocrinology",
      reason: "Diabetes Management",
      status: "completed",
      notes: "Blood sugar levels improved. HbA1c down to 6.8%.",
    },
    {
      id: 3,
      date: "2024-10-30",
      doctor: "Dr. Wilson",
      specialty: "General Medicine",
      reason: "Annual Check-up",
      status: "completed",
      notes: "Overall health good. Vitamin D levels normalized.",
    },
  ],
  labResults: [
    {
      id: 1,
      test: "Complete Blood Count (CBC)",
      date: "2024-11-20",
      results: "Normal - All values within range",
      doctor: "Dr. Smith",
      status: "normal",
    },
    {
      id: 2,
      test: "Lipid Profile",
      date: "2024-11-20",
      results: "Total Cholesterol: 195 mg/dL (Normal)",
      doctor: "Dr. Johnson",
      status: "normal",
    },
    {
      id: 3,
      test: "HbA1c",
      date: "2024-11-15",
      results: "6.8% (Improved from 7.2%)",
      doctor: "Dr. Smith",
      status: "improved",
    },
    {
      id: 4,
      test: "Vitamin D Level",
      date: "2024-10-25",
      results: "32 ng/mL (Normal range achieved)",
      doctor: "Dr. Wilson",
      status: "normal",
    },
  ],
};

export function MedicalHistorySidebar({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: IconUser },
    { id: "medications", label: "Medications", icon: IconPill },
    { id: "history", label: "Medical History", icon: IconReportMedical },
    { id: "appointments", label: "Recent Visits", icon: IconCalendar },
    { id: "labs", label: "Lab Results", icon: IconStethoscope },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "mild":
        return "text-green-600 bg-green-100 border-green-200";
      case "moderate":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "severe":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-100";
      case "improved":
        return "text-blue-600 bg-blue-100";
      case "attention":
        return "text-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderEmergency = () => (
    <EmergencyCallButton />
  );

  const renderDiagnosis = () => (
    <MedicalReportDiagnosis user={{ name: "John Doe" }} />
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Emergency Services Box */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
          <IconAlertTriangle className="w-5 h-5 mr-2" />
          Emergency Services
        </h3>
        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          Connect instantly with emergency doctors for critical situations
        </p>
        <div className="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
          <EmergencyCallButton />
        </div>
      </div>

      {/* AI Diagnosis Box */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
          <IconScan className="w-5 h-5 mr-2" />
          AI Diagnosis
        </h3>
        <p className="text-sm text-purple-700 dark:text-purple-400 mb-4">
          Analyze medical reports instantly with AI-powered diagnosis
        </p>
        <div className="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
          <MedicalReportDiagnosis user={{ name: "John Doe" }} />
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
          <IconUser className="w-5 h-5 mr-2" />
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Blood Type:</span>
            <span className="ml-2 font-medium text-red-600">{MEDICAL_HISTORY_DATA.personalInfo.bloodType}</span>
          </div>
          <div>
            <span className="text-gray-600">DOB:</span>
            <span className="ml-2 font-medium">{MEDICAL_HISTORY_DATA.personalInfo.dateOfBirth}</span>
          </div>
          <div>
            <span className="text-gray-600">Height:</span>
            <span className="ml-2 font-medium">{MEDICAL_HISTORY_DATA.personalInfo.height}</span>
          </div>
          <div>
            <span className="text-gray-600">Weight:</span>
            <span className="ml-2 font-medium">{MEDICAL_HISTORY_DATA.personalInfo.weight}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Insurance:</span>
            <span className="ml-2 font-medium">{MEDICAL_HISTORY_DATA.personalInfo.insuranceProvider}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Primary Doctor:</span>
            <span className="ml-2 font-medium text-purple-600">{MEDICAL_HISTORY_DATA.personalInfo.primaryPhysician}</span>
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <IconHeartbeat className="w-5 h-5 mr-2" />
          Latest Vital Signs
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Blood Pressure:</span>
            <span className="ml-2 font-medium text-orange-600">{MEDICAL_HISTORY_DATA.personalInfo.bloodPressure}</span>
          </div>
          <div>
            <span className="text-gray-600">Heart Rate:</span>
            <span className="ml-2 font-medium text-green-600">{MEDICAL_HISTORY_DATA.personalInfo.heartRate}</span>
          </div>
          <div>
            <span className="text-gray-600">Temperature:</span>
            <span className="ml-2 font-medium">{MEDICAL_HISTORY_DATA.personalInfo.temperature}</span>
          </div>
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
          <IconAlertTriangle className="w-5 h-5 mr-2" />
          Allergies & Alerts
        </h3>
        <div className="flex flex-wrap gap-2">
          {MEDICAL_HISTORY_DATA.personalInfo.allergies.map((allergy, index) => (
            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-300">
              ⚠️ {allergy}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
          <div className="text-xl font-bold text-blue-600">{MEDICAL_HISTORY_DATA.currentMedications.length}</div>
          <div className="text-xs text-blue-800">Current Meds</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
          <div className="text-xl font-bold text-green-600">{MEDICAL_HISTORY_DATA.recentAppointments.length}</div>
          <div className="text-xs text-green-800">Recent Visits</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
          <div className="text-xl font-bold text-purple-600">{MEDICAL_HISTORY_DATA.labResults.length}</div>
          <div className="text-xs text-purple-800">Lab Results</div>
        </div>
      </div>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
        <IconPill className="w-5 h-5 mr-2 text-blue-600 dark:text-teal-400" />
        Current Medications
      </h3>
      {MEDICAL_HISTORY_DATA.currentMedications.map((med) => (
        <div key={med.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">{med.name}</h4>
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
              {med.condition}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span className="font-medium">Dosage:</span> {med.dosage}</div>
            <div><span className="font-medium">Frequency:</span> {med.frequency}</div>
            <div><span className="font-medium">Prescribed by:</span> {med.prescribedBy}</div>
            <div><span className="font-medium">Started:</span> {med.startDate}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
        <IconReportMedical className="w-5 h-5 mr-2 text-blue-600 dark:text-teal-400" />
        Past Medical History
      </h3>
      {MEDICAL_HISTORY_DATA.pastMedicalHistory.map((record) => (
        <div key={record.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">{record.condition}</h4>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {record.category}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(record.severity)}`}>
                {record.severity}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span className="font-medium">Date:</span> {record.date}</div>
            <div><span className="font-medium">Doctor:</span> {record.doctor}</div>
            <div><span className="font-medium">Hospital:</span> {record.hospital}</div>
            <div className="mt-2">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-gray-700 italic text-xs leading-relaxed">{record.notes}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
        <IconCalendar className="w-5 h-5 mr-2 text-blue-600 dark:text-teal-400" />
        Recent Appointments
      </h3>
      {MEDICAL_HISTORY_DATA.recentAppointments.map((appointment) => (
        <div key={appointment.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">{appointment.reason}</h4>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {appointment.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span className="font-medium">Date:</span> {appointment.date}</div>
            <div><span className="font-medium">Doctor:</span> {appointment.doctor}</div>
            <div><span className="font-medium">Specialty:</span> {appointment.specialty}</div>
            <div className="mt-2">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-gray-700 italic">{appointment.notes}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLabResults = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
        <IconStethoscope className="w-5 h-5 mr-2 text-blue-600 dark:text-teal-400" />
        Laboratory Results
      </h3>
      {MEDICAL_HISTORY_DATA.labResults.map((lab) => (
        <div key={lab.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">{lab.test}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lab.status)}`}>
              {lab.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span className="font-medium">Date:</span> {lab.date}</div>
            <div><span className="font-medium">Doctor:</span> {lab.doctor}</div>
            <div className="mt-2">
              <span className="font-medium">Results:</span>
              <p className="mt-1 text-gray-700 font-medium">{lab.results}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "medications":
        return renderMedications();
      case "history":
        return renderHistory();
      case "appointments":
        return renderAppointments();
      case "labs":
        return renderLabResults();
      default:
        return renderOverview();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IconClipboardList className="w-6 h-6" />
                <h2 className="text-xl font-bold">Medical History</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderTabContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}