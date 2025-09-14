"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  IconCheck, 
  IconX, 
  IconUser, 
  IconCertificate, 
  IconFileText, 
  IconExternalLink,
  IconSchool,
  IconStethoscope,
  IconBuildingHospital,
  IconCurrencyDollar,
  IconEye,
  IconClock
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateDoctorStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { toast } from "sonner";

export function PendingDoctors({ doctors }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  // Custom hook for approve/reject server action
  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateDoctorStatus);

  // Open doctor details dialog
  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setVerificationNotes(doctor.verificationNotes || "");
  };

  // Close doctor details dialog
  const handleCloseDialog = () => {
    setSelectedDoctor(null);
    setVerificationNotes("");
  };

  // Handle approve or reject doctor
  const handleUpdateStatus = async (doctorId, status) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("status", status);
    if (status === "REJECTED" && verificationNotes.trim()) {
      formData.append("verificationNotes", verificationNotes.trim());
    }

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      toast.success("Doctor verification status updated successfully");
      handleCloseDialog();
    }
  }, [data]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: IconClock, 
        text: "Pending" 
      },
      UNDER_REVIEW: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: IconEye, 
        text: "Under Review" 
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 px-2 py-1 border`}>
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const DocumentLink = ({ url, title }) => {
    if (!url) return <span className="text-gray-400">Not provided</span>;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(url, '_blank')}
        className="h-auto p-2 text-blue-600 hover:text-blue-800"
      >
        <IconEye className="h-4 w-4 mr-2" />
        View {title}
      </Button>
    );
  };

  return (
    <div>
      <Card className="bg-white dark:bg-gray-800 border border-purple-700/30 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Doctor Verification Queue
          </CardTitle>
          <CardDescription>
            Review and approve doctor verification applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IconCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No pending verification requests at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="border border-gray-200 hover:border-purple-300 transition-all hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-2">
                          <IconStethoscope className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {doctor.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {doctor.specialty && (
                              <Badge variant="outline" className="text-xs">
                                {doctor.specialty}
                              </Badge>
                            )}
                            {doctor.experience && (
                              <Badge variant="outline" className="text-xs">
                                {doctor.experience} years exp.
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {getStatusBadge(doctor.verificationStatus)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(doctor)}
                          className="border-purple-200 hover:bg-purple-50"
                        >
                          <IconEye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Verification Review Dialog */}
      {selectedDoctor && (
        <Dialog open={!!selectedDoctor} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <IconCertificate className="h-5 w-5" />
                Doctor Verification Review
              </DialogTitle>
              <DialogDescription>
                Carefully review all information and documents before making a decision
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <IconUser className="h-4 w-4" />
                    Full Name
                  </h4>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {selectedDoctor.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Email Address
                  </h4>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {selectedDoctor.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Application Date
                  </h4>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {format(new Date(selectedDoctor.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <IconStethoscope className="h-5 w-5" />
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  {selectedDoctor.medicalDegree && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <IconSchool className="h-4 w-4" />
                        Medical Degree
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">{selectedDoctor.medicalDegree}</p>
                    </div>
                  )}

                  {selectedDoctor.licenseNumber && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <IconCertificate className="h-4 w-4" />
                        License Number
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">{selectedDoctor.licenseNumber}</p>
                    </div>
                  )}

                  {selectedDoctor.specialty && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Specialty
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">{selectedDoctor.specialty}</p>
                    </div>
                  )}

                  {selectedDoctor.experience && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Years of Experience
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">{selectedDoctor.experience} years</p>
                    </div>
                  )}

                  {selectedDoctor.workingHospital && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <IconBuildingHospital className="h-4 w-4" />
                        Working Hospital/Clinic
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">{selectedDoctor.workingHospital}</p>
                    </div>
                  )}

                  {selectedDoctor.consultationFee && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <IconCurrencyDollar className="h-4 w-4" />
                        Consultation Fee
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">${selectedDoctor.consultationFee}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Document Verification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <IconFileText className="h-5 w-5" />
                  Document Verification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Medical Degree Certificate
                    </h4>
                    <DocumentLink url={selectedDoctor.medicalDegreeUrl} title="Degree" />
                  </div>

                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Medical License
                    </h4>
                    <DocumentLink url={selectedDoctor.medicalLicenseUrl} title="License" />
                  </div>

                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Identity Proof
                    </h4>
                    <DocumentLink url={selectedDoctor.identityProofUrl} title="ID" />
                  </div>

                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Experience Certificate
                    </h4>
                    <DocumentLink url={selectedDoctor.experienceCertUrl} title="Certificate" />
                  </div>
                </div>
              </div>

              {/* Professional Bio */}
              {selectedDoctor.description && (
                <>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                      Professional Bio
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      {selectedDoctor.description}
                    </p>
                  </div>
                </>
              )}

              {/* Verification Notes */}
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <Label htmlFor="verificationNotes">
                  Verification Notes (Optional - for rejections or additional comments)
                </Label>
                <Textarea
                  id="verificationNotes"
                  placeholder="Add any notes about the verification decision..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {loading && (
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse"></div>
              </div>
            )}

            <DialogFooter className="flex sm:justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => handleCloseDialog()}
                disabled={loading}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedDoctor.id, "REJECTED")}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <IconX className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedDoctor.id, "VERIFIED")}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <IconCheck className="mr-2 h-4 w-4" />
                  Approve & Verify
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
