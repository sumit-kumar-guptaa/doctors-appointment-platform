import { getCurrentUser } from "@/actions/onboarding";
import { getPatientAppointments } from "@/actions/patient";
import PatientEmergencyDashboard from "@/components/patient-emergency-dashboard";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Shield, 
  Clock, 
  Phone,
  FileCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload
} from "lucide-react";

export default async function PatientEmergencyPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<Shield />}
        title="Emergency Medical Services"
        subtitle="24/7 Emergency care and AI-powered health assessments"
        backLink="/patient"
        backLabel="Back to Dashboard"
      />

      {/* Emergency Dashboard */}
      <PatientEmergencyDashboard user={user} />

      {/* Emergency Services Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* KYC Verification Section */}
        <Card className={`border-2 ${user.kycVerified ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileCheck className={`h-5 w-5 mr-2 ${user.kycVerified ? 'text-green-400' : 'text-red-400'}`} />
              KYC Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Identity Verification</span>
              {user.kycVerified ? (
                <Badge variant="secondary" className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
            
            {!user.kycVerified && (
              <>
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">KYC Required for Emergency Calls</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Complete your KYC verification to access emergency calling features
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Required Documents:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Aadhaar Card</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>PAN Card</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Photo ID</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Address Proof</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment & EMI Options */}
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-400" />
              Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-medium">Emergency Verification</span>
                  <span className="text-white font-bold">₹1</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">One-time payment to verify emergency access</p>
              </div>
              
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-medium">Emergency Consultation</span>
                  <span className="text-white font-bold">₹500</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Direct doctor consultation for emergencies</p>
                <div className="mt-2 text-xs text-yellow-400">
                  EMI Available: ₹167/month for 3 months
                </div>
              </div>
              
              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-medium">Emergency Home Visit</span>
                  <span className="text-white font-bold">₹2000</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Doctor visit to your location</p>
                <div className="mt-2 text-xs text-yellow-400">
                  EMI Available: ₹334/month for 6 months
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400">
              Setup Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Guidelines */}
      <Card className="border-emerald-900/20 mt-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
            Emergency Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-400 mb-3">🚨 Call 108 Immediately If:</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Chest pain or heart attack symptoms</li>
                <li>• Difficulty breathing or choking</li>
                <li>• Severe bleeding or trauma</li>
                <li>• Loss of consciousness</li>
                <li>• Severe allergic reactions</li>
                <li>• Stroke symptoms (FAST test)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-400 mb-3">⚡ Use Our Emergency AI For:</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Non-life-threatening symptoms</li>
                <li>• Health assessment and guidance</li>
                <li>• Medication queries</li>
                <li>• First aid instructions</li>
                <li>• Finding nearby hospitals</li>
                <li>• Symptom severity evaluation</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 font-medium">
              ⚠️ Disclaimer: Our AI assessment is for guidance only. Always consult healthcare professionals for serious conditions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Emergency Activity */}
      <Card className="border-emerald-900/20 mt-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-emerald-400" />
            Recent Emergency Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No emergency consultations yet</p>
            <p className="text-sm mt-1">Your emergency history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}