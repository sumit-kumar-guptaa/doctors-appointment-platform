import { getCurrentUser } from "@/actions/onboarding";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Calendar,
  Pill,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Eye,
  TestTube
} from "lucide-react";

export default async function MedicalHistoryPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  // Mock data - replace with actual data fetching
  const medicalRecords = [
    {
      id: 1,
      date: "2024-01-15",
      type: "Consultation",
      doctor: "Dr. Sarah Wilson",
      diagnosis: "Hypertension management",
      prescription: "Lisinopril 10mg daily",
      notes: "Blood pressure well controlled"
    },
    {
      id: 2,
      date: "2024-01-08",
      type: "Lab Results",
      doctor: "Dr. Michael Chen",
      diagnosis: "Annual health checkup",
      prescription: "Continue current medications",
      notes: "All parameters within normal range"
    }
  ];

  const vitals = [
    { label: "Blood Pressure", value: "120/80 mmHg", status: "normal", date: "Jan 15, 2024" },
    { label: "Heart Rate", value: "72 bpm", status: "normal", date: "Jan 15, 2024" },
    { label: "Temperature", value: "98.6°F", status: "normal", date: "Jan 15, 2024" },
    { label: "Weight", value: "70 kg", status: "normal", date: "Jan 15, 2024" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'critical':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Consultation':
        return <Activity className="h-4 w-4" />;
      case 'Lab Results':
        return <TestTube className="h-4 w-4" />;
      case 'Prescription':
        return <Pill className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<FileText />}
        title="Medical History"
        subtitle="Your complete medical records and health information"
        backLink="/patient"
        backLabel="Back to Dashboard"
      />

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Records
        </Button>
        
        <Button variant="outline" className="border-blue-500/50 text-blue-400">
          <Download className="h-4 w-4 mr-2" />
          Download History
        </Button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search medical records..." 
            className="pl-10 bg-gray-800/50 border-gray-700"
          />
        </div>
      </div>

      {/* Latest Vitals */}
      <Card className="border-emerald-900/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-emerald-400" />
            Latest Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vitals.map((vital, index) => (
              <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{vital.label}</span>
                  <Badge className={getStatusColor(vital.status)}>
                    {vital.status}
                  </Badge>
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {vital.value}
                </div>
                <div className="text-xs text-gray-500">
                  {vital.date}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medical Records */}
      <Card className="border-emerald-900/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-400" />
            Medical Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicalRecords.map((record) => (
              <div key={record.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                      {getTypeIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-white">{record.type}</h3>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {record.date}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-1">
                        <strong>Doctor:</strong> {record.doctor}
                      </p>
                      <p className="text-sm text-gray-400 mb-1">
                        <strong>Diagnosis:</strong> {record.diagnosis}
                      </p>
                      
                      {record.prescription && (
                        <p className="text-sm text-blue-400 mb-2">
                          <strong>Prescription:</strong> {record.prescription}
                        </p>
                      )}
                      
                      {record.notes && (
                        <div className="p-2 bg-gray-700/50 rounded text-sm text-gray-300">
                          <strong>Notes:</strong> {record.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline" className="border-gray-600">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Medications */}
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Pill className="h-5 w-5 mr-2 text-emerald-400" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-blue-400">Lisinopril</h4>
                    <p className="text-sm text-gray-400">10mg daily</p>
                    <p className="text-xs text-gray-500 mt-1">For hypertension</p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>
              
              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-purple-400">Vitamin D3</h4>
                    <p className="text-sm text-gray-400">1000 IU daily</p>
                    <p className="text-xs text-gray-500 mt-1">Supplement</p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4 border-gray-600">
              <Pill className="h-4 w-4 mr-2" />
              Manage Medications
            </Button>
          </CardContent>
        </Card>

        {/* Allergies & Conditions */}
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-400" />
              Allergies & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-400 mb-2">Allergies</h4>
                <div className="space-y-2">
                  <Badge variant="destructive" className="mr-2">
                    Penicillin
                  </Badge>
                  <Badge variant="destructive">
                    Shellfish
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-400 mb-2">Chronic Conditions</h4>
                <div className="space-y-2">
                  <Badge className="bg-yellow-600 mr-2">
                    Hypertension
                  </Badge>
                  <Badge className="bg-blue-600">
                    Vitamin D Deficiency
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4 border-gray-600">
              <FileText className="h-4 w-4 mr-2" />
              Update Information
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Record Form */}
      <Card className="border-emerald-900/20 mt-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="h-5 w-5 mr-2 text-emerald-400" />
            Add New Record
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Record Type
              </label>
              <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                <option>Consultation</option>
                <option>Lab Results</option>
                <option>Prescription</option>
                <option>Vaccination</option>
                <option>Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <Input 
                type="date" 
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <Textarea 
              placeholder="Enter record details..."
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Files
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">
                Drop files here or click to browse
              </p>
            </div>
          </div>
          
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Upload className="h-4 w-4 mr-2" />
            Save Record
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}