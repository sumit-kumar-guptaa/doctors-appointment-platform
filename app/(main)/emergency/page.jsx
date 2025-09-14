import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import EmergencyCallButton from "@/components/emergency-call-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scan, FileText, Brain, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function EmergencyPage() {
  const user = await getCurrentUser();

  // Allow access for development - comment out role check temporarily
  // if (!user || user.role !== "PATIENT") {
  //   redirect("/");
  // }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Emergency Call Card */}
        <Card className="border-red-300 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-600 text-white rounded-lg">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900">Emergency Call</h2>
                <p className="text-red-700">Connect with doctors instantly</p>
              </div>
            </div>
            <p className="text-red-800 mb-4">
              For immediate medical consultation with emergency physicians. Available 24/7 with connection in under 30 seconds.
            </p>
            <div className="w-full">
              <EmergencyCallButton user={user} />
            </div>
          </CardContent>
        </Card>

        {/* Medical Report Analysis Card */}
        <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-600 text-white rounded-lg">
                <Scan className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900">AI Diagnosis</h2>
                <p className="text-blue-700">Analyze medical reports instantly</p>
              </div>
            </div>
            <p className="text-blue-800 mb-4">
              Upload medical reports for AI-powered analysis, disease detection, and specialist doctor recommendations.
            </p>
            <Link href="/emergency-diagnosis">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                <FileText className="h-5 w-5 mr-2" />
                ANALYZE MEDICAL REPORT
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">AI Analysis</h3>
            <p className="text-sm text-green-700">Advanced OCR & disease detection</p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-300 bg-purple-50">
          <CardContent className="p-4 text-center">
            <Stethoscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-900">Specialist Match</h3>
            <p className="text-sm text-purple-700">Find the right doctor for you</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-900">Report Summary</h3>
            <p className="text-sm text-orange-700">Easy-to-understand results</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}