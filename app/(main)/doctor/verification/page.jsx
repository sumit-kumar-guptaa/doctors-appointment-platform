"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUpload,
  IconCheck,
  IconX,
  IconClock,
  IconAlertTriangle,
  IconFileText,
  IconUser,
  IconSchool,
  IconCertificate,
  IconStethoscope,
  IconBuildingHospital,
  IconCurrencyDollar,
  IconEye,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { submitDoctorVerification, getDoctorVerificationStatus } from "@/actions/doctor";

const SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Dermatology", 
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Gynecology",
  "Ophthalmology",
  "ENT (Ear, Nose, Throat)",
  "Dentistry",
  "Radiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Anesthesiology",
  "Pathology",
  "Oncology",
  "Endocrinology",
  "Gastroenterology"
];

export default function DoctorVerificationPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [existingData, setExistingData] = useState(null);

  const [formData, setFormData] = useState({
    medicalDegree: "",
    licenseNumber: "",
    specialty: "",
    experience: "",
    workingHospital: "",
    consultationFee: "",
    description: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    medicalDegreeUrl: null,
    medicalLicenseUrl: null,
    identityProofUrl: null,
    experienceCertUrl: null,
  });

  const [filePreview, setFilePreview] = useState({
    medicalDegreeUrl: null,
    medicalLicenseUrl: null,
    identityProofUrl: null,
    experienceCertUrl: null,
  });

  // Load existing verification data
  useEffect(() => {
    const loadVerificationData = async () => {
      try {
        const data = await getDoctorVerificationStatus();
        if (data) {
          setVerificationStatus(data.verificationStatus || "PENDING");
          setExistingData(data);
          setFormData({
            medicalDegree: data.medicalDegree || "",
            licenseNumber: data.licenseNumber || "",
            specialty: data.specialty || "",
            experience: data.experience?.toString() || "",
            workingHospital: data.workingHospital || "",
            consultationFee: data.consultationFee?.toString() || "",
            description: data.description || "",
          });
        }
      } catch (error) {
        console.error("Error loading verification data:", error);
      }
    };

    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (fileType, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only PDF, JPG, JPEG, or PNG files");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(prev => ({
        ...prev,
        [fileType]: previewUrl
      }));

      toast.success(`${fileType.replace('Url', '')} uploaded successfully`);
    }
  };

  const removeFile = (fileType) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    setFilePreview(prev => ({
      ...prev,
      [fileType]: null
    }));
    toast.success("File removed");
  };

  const handleSubmitVerification = async () => {
    if (!formData.medicalDegree || !formData.licenseNumber || !formData.specialty) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!uploadedFiles.medicalDegreeUrl || !uploadedFiles.medicalLicenseUrl) {
      toast.error("Please upload medical degree and license documents");
      return;
    }

    setLoading(true);
    try {
      const formDataToSubmit = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });

      // Add files
      Object.keys(uploadedFiles).forEach(key => {
        if (uploadedFiles[key]) {
          formDataToSubmit.append(key, uploadedFiles[key]);
        }
      });

      await submitDoctorVerification(formDataToSubmit);
      setVerificationStatus("UNDER_REVIEW");
      toast.success("Verification documents submitted successfully! Our team will review them within 24-48 hours.");
    } catch (error) {
      toast.error("Failed to submit verification documents");
      console.error("Verification submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: IconClock, 
        text: "Pending Submission" 
      },
      UNDER_REVIEW: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: IconEye, 
        text: "Under Review" 
      },
      VERIFIED: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: IconCheck, 
        text: "Verified" 
      },
      REJECTED: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: IconX, 
        text: "Rejected" 
      }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-2 px-3 py-1 border`}>
        <IconComponent className="h-4 w-4" />
        {config.text}
      </Badge>
    );
  };

  const FileUploadCard = ({ title, description, icon: Icon, fileType, required = false }) => {
    const file = uploadedFiles[fileType];
    const preview = filePreview[fileType];

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-orange-400" />
            {title}
            {required && <span className="text-red-500">*</span>}
          </CardTitle>
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div className="border-2 border-dashed border-purple-400/50 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(fileType, e)}
                className="hidden"
                id={fileType}
              />
              <label
                htmlFor={fileType}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <IconUpload className="h-8 w-8 text-orange-400" />
                <p className="text-sm font-medium text-orange-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, JPEG, PNG (Max 5MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconFileText className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{file.name}</p>
                  <p className="text-sm text-green-600">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {preview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(preview)}
                  >
                    <IconEye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileType)}
                  className="text-red-600 hover:text-red-700"
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (verificationStatus === "VERIFIED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-orange-900 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <IconCheck className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800">Verification Complete!</h1>
            <p className="text-lg text-green-600">
              Your profile has been verified. You can now start accepting appointments.
            </p>
            <Button onClick={() => window.location.href = '/doctor'} className="mt-4">
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-orange-900 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white dark:text-white">
            Doctor Verification
          </h1>
          <p className="text-lg text-orange-200 dark:text-orange-300">
            Complete your profile verification to start practicing on our platform
          </p>
          {getStatusBadge(verificationStatus)}
        </motion.div>

        {/* Verification Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-orange-400" />
              Verification Requirements
            </CardTitle>
            <CardDescription>
              Please provide all required documents and information for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: IconSchool, title: "Medical Degree", desc: "Upload your medical degree certificate" },
                { icon: IconCertificate, title: "Medical License", desc: "Current medical practice license" },
                { icon: IconUser, title: "Identity Proof", desc: "Government issued ID proof" },
                { icon: IconFileText, title: "Experience Certificate", desc: "Work experience certificates" }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-purple-900/20 dark:bg-purple-950/20 rounded-lg">
                  <item.icon className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white dark:text-white">{item.title}</h3>
                    <p className="text-sm text-orange-200 dark:text-orange-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professional Information Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconStethoscope className="h-5 w-5 text-orange-400" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="medicalDegree">Medical Degree <span className="text-red-500">*</span></Label>
                <Input
                  id="medicalDegree"
                  placeholder="e.g., MBBS, MD, DO"
                  value={formData.medicalDegree}
                  onChange={(e) => handleInputChange("medicalDegree", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License Number <span className="text-red-500">*</span></Label>
                <Input
                  id="licenseNumber"
                  placeholder="e.g., MD123456"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleInputChange("specialty", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHospital">Current Working Hospital/Clinic</Label>
                <Input
                  id="workingHospital"
                  placeholder="e.g., City General Hospital"
                  value={formData.workingHospital}
                  onChange={(e) => handleInputChange("workingHospital", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (USD)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.consultationFee}
                  onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Professional Bio</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your expertise and experience..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white dark:text-white">Document Upload</h2>          <div className="grid md:grid-cols-2 gap-6">
            <FileUploadCard
              title="Medical Degree Certificate"
              description="Upload your medical degree certificate (MBBS, MD, etc.)"
              icon={IconSchool}
              fileType="medicalDegreeUrl"
              required={true}
            />

            <FileUploadCard
              title="Medical License"
              description="Upload your current medical practice license"
              icon={IconCertificate}
              fileType="medicalLicenseUrl"
              required={true}
            />

            <FileUploadCard
              title="Identity Proof"
              description="Government issued photo ID (Driver's License, Passport, etc.)"
              icon={IconUser}
              fileType="identityProofUrl"
            />

            <FileUploadCard
              title="Experience Certificate"
              description="Work experience certificates from previous employers"
              icon={IconFileText}
              fileType="experienceCertUrl"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleSubmitVerification}
            disabled={loading || verificationStatus === "UNDER_REVIEW"}
            className="px-12 py-3 text-lg bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : verificationStatus === "UNDER_REVIEW" ? (
              "Under Review"
            ) : (
              "Submit for Verification"
            )}
          </Button>
        </div>

        {/* Status Information */}
        {verificationStatus === "UNDER_REVIEW" && (
          <Card className="bg-purple-900/20 border-purple-700/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <IconClock className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="font-medium text-white">Your application is under review</p>
                  <p className="text-sm text-orange-200">
                    Our verification team will review your documents within 24-48 hours. 
                    You will receive an email notification once the review is complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationStatus === "REJECTED" && existingData?.verificationNotes && (
          <Card className="bg-red-900/20 border-red-700/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <IconX className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-300">Verification Rejected</p>
                  <p className="text-sm text-red-200 mt-1">
                    {existingData.verificationNotes}
                  </p>
                  <p className="text-sm text-red-200 mt-2">
                    Please address the issues mentioned above and resubmit your application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
