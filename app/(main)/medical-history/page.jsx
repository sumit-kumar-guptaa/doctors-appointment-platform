"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IconCalendar, 
  IconStethoscope, 
  IconPill, 
  IconHeartbeat,
  IconActivity,
  IconClipboardList,
  IconAlertTriangle,
  IconDownload,
  IconEye,
  IconUser
} from "@tabler/icons-react";

// Dummy medical data
const dummyMedicalHistory = {
  personalInfo: {
    name: "Sarah Johnson",
    age: 34,
    bloodType: "O+",
    height: "5'6\"",
    weight: "140 lbs",
    allergies: ["Penicillin", "Shellfish"],
    emergencyContact: {
      name: "John Johnson",
      relation: "Husband",
      phone: "+1 (555) 123-4567"
    }
  },
  consultations: [
    {
      id: 1,
      date: "2024-01-15",
      doctor: "Dr. Emily Rodriguez",
      specialty: "Cardiology",
      diagnosis: "Routine Cardiac Checkup",
      notes: "Patient reports occasional chest tightness. ECG normal, blood pressure slightly elevated (140/90). Recommended lifestyle changes and follow-up in 3 months.",
      status: "Completed",
      prescriptions: ["Lisinopril 10mg daily", "Lifestyle modifications"]
    },
    {
      id: 2,
      date: "2024-02-28",
      doctor: "Dr. Michael Chen",
      specialty: "General Medicine",
      diagnosis: "Annual Physical Exam",
      notes: "Overall health good. Updated vaccinations. Discussed preventive care measures.",
      status: "Completed",
      prescriptions: ["Multivitamin", "Flu vaccine administered"]
    },
    {
      id: 3,
      date: "2024-03-10",
      doctor: "Dr. Lisa Thompson",
      specialty: "Dermatology",
      diagnosis: "Skin Consultation",
      notes: "Routine mole check. One suspicious lesion biopsied - results benign. Continue sun protection.",
      status: "Completed",
      prescriptions: ["Sunscreen SPF 50+", "Moisturizer with ceramides"]
    },
    {
      id: 4,
      date: "2024-04-05",
      doctor: "Dr. Emily Rodriguez",
      specialty: "Cardiology",
      diagnosis: "Follow-up Consultation",
      notes: "Blood pressure improved (125/80). Patient has been following dietary recommendations. Continue current medications.",
      status: "Completed",
      prescriptions: ["Continue Lisinopril 10mg daily"]
    }
  ],
  medications: [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Emily Rodriguez",
      startDate: "2024-01-15",
      status: "Active"
    },
    {
      name: "Multivitamin",
      dosage: "1 tablet",
      frequency: "Once daily",
      prescribedBy: "Dr. Michael Chen",
      startDate: "2024-02-28",
      status: "Active"
    }
  ],
  labResults: [
    {
      id: 1,
      date: "2024-01-15",
      testName: "Comprehensive Metabolic Panel",
      results: [
        { parameter: "Glucose", value: "95", unit: "mg/dL", range: "70-100", status: "Normal" },
        { parameter: "Creatinine", value: "0.9", unit: "mg/dL", range: "0.6-1.2", status: "Normal" },
        { parameter: "Total Cholesterol", value: "195", unit: "mg/dL", range: "<200", status: "Normal" },
        { parameter: "HDL", value: "55", unit: "mg/dL", range: ">40", status: "Good" },
        { parameter: "LDL", value: "115", unit: "mg/dL", range: "<100", status: "Borderline" }
      ],
      doctor: "Dr. Emily Rodriguez"
    },
    {
      id: 2,
      date: "2024-02-28",
      testName: "Complete Blood Count",
      results: [
        { parameter: "White Blood Cells", value: "7.2", unit: "K/uL", range: "4.0-11.0", status: "Normal" },
        { parameter: "Red Blood Cells", value: "4.5", unit: "M/uL", range: "4.0-5.2", status: "Normal" },
        { parameter: "Hemoglobin", value: "13.8", unit: "g/dL", range: "12.0-15.5", status: "Normal" },
        { parameter: "Platelets", value: "285", unit: "K/uL", range: "150-450", status: "Normal" }
      ],
      doctor: "Dr. Michael Chen"
    }
  ],
  vitals: [
    {
      date: "2024-04-05",
      bloodPressure: "125/80",
      heartRate: "72",
      temperature: "98.6",
      weight: "140",
      height: "66"
    },
    {
      date: "2024-02-28",
      bloodPressure: "135/85",
      heartRate: "78",
      temperature: "98.4",
      weight: "142",
      height: "66"
    },
    {
      date: "2024-01-15",
      bloodPressure: "140/90",
      heartRate: "80",
      temperature: "98.7",
      weight: "143",
      height: "66"
    }
  ]
};

export default function MedicalHistoryPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "active": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "normal": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "good": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "borderline": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
              Medical History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete overview of your health records and medical consultations
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white">
            <IconDownload className="w-4 h-4 mr-2" />
            Export Records
          </Button>
        </motion.div>

        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="w-5 h-5 text-purple-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Basic Info</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {dummyMedicalHistory.personalInfo.name}</p>
                    <p><span className="font-medium">Age:</span> {dummyMedicalHistory.personalInfo.age}</p>
                    <p><span className="font-medium">Blood Type:</span> {dummyMedicalHistory.personalInfo.bloodType}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Physical</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="font-medium">Height:</span> {dummyMedicalHistory.personalInfo.height}</p>
                    <p><span className="font-medium">Weight:</span> {dummyMedicalHistory.personalInfo.weight}</p>
                    <p><span className="font-medium">Allergies:</span> {dummyMedicalHistory.personalInfo.allergies.join(", ")}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Emergency Contact</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {dummyMedicalHistory.personalInfo.emergencyContact.name}</p>
                    <p><span className="font-medium">Relation:</span> {dummyMedicalHistory.personalInfo.emergencyContact.relation}</p>
                    <p><span className="font-medium">Phone:</span> {dummyMedicalHistory.personalInfo.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for different sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
              <TabsTrigger value="consultations" className="flex items-center gap-2">
                <IconStethoscope className="w-4 h-4" />
                Consultations
              </TabsTrigger>
              <TabsTrigger value="medications" className="flex items-center gap-2">
                <IconPill className="w-4 h-4" />
                Medications
              </TabsTrigger>
              <TabsTrigger value="labs" className="flex items-center gap-2">
                <IconActivity className="w-4 h-4" />
                Lab Results
              </TabsTrigger>
              <TabsTrigger value="vitals" className="flex items-center gap-2">
                <IconHeartbeat className="w-4 h-4" />
                Vitals
              </TabsTrigger>
            </TabsList>

            {/* Consultations Tab */}
            <TabsContent value="consultations" className="space-y-4">
              {dummyMedicalHistory.consultations.map((consultation, index) => (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{consultation.diagnosis}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <IconCalendar className="w-4 h-4" />
                            {consultation.date} • {consultation.doctor} • {consultation.specialty}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Notes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {consultation.notes}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Prescriptions</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {consultation.prescriptions.map((prescription, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {prescription}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-4">
              {dummyMedicalHistory.medications.map((medication, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{medication.name}</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Dosage:</span> {medication.dosage}</p>
                            <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
                            <p><span className="font-medium">Prescribed by:</span> {medication.prescribedBy}</p>
                            <p><span className="font-medium">Start Date:</span> {medication.startDate}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(medication.status)}>
                          {medication.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Lab Results Tab */}
            <TabsContent value="labs" className="space-y-4">
              {dummyMedicalHistory.labResults.map((lab, index) => (
                <motion.div
                  key={lab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{lab.testName}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <IconCalendar className="w-4 h-4" />
                            {lab.date} • {lab.doctor}
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline">
                          <IconEye className="w-4 h-4 mr-2" />
                          View Full Report
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lab.results.map((result, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                            <div>
                              <p className="font-medium text-sm">{result.parameter}</p>
                              <p className="text-xs text-gray-500">Range: {result.range}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{result.value} {result.unit}</span>
                              <Badge className={getStatusColor(result.status)} size="sm">
                                {result.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="space-y-4">
              {dummyMedicalHistory.vitals.map((vital, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconHeartbeat className="w-5 h-5 text-red-500" />
                        Vital Signs - {vital.date}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Blood Pressure</p>
                          <p className="font-bold text-lg text-red-600">{vital.bloodPressure}</p>
                          <p className="text-xs text-gray-500">mmHg</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Heart Rate</p>
                          <p className="font-bold text-lg text-blue-600">{vital.heartRate}</p>
                          <p className="text-xs text-gray-500">bpm</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                          <p className="font-bold text-lg text-orange-600">{vital.temperature}</p>
                          <p className="text-xs text-gray-500">°F</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                          <p className="font-bold text-lg text-green-600">{vital.weight}</p>
                          <p className="text-xs text-gray-500">lbs</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                          <p className="font-bold text-lg text-purple-600">{vital.height}</p>
                          <p className="text-xs text-gray-500">inches</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}