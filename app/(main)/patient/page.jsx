import { getCurrentUser } from "@/actions/onboarding";
import { getPatientAppointments } from "@/actions/patient";
import PatientEmergencyDashboard from "@/components/patient-emergency-dashboard";
import { AppointmentCard } from "@/components/appointment-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Calendar, 
  Stethoscope, 
  FileText, 
  CreditCard, 
  Settings,
  Clock,
  TrendingUp
} from "lucide-react";

export default async function PatientDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const { appointments } = await getPatientAppointments();
  const upcomingAppointments = appointments?.filter(apt => 
    new Date(apt.scheduledFor) > new Date()
  ).slice(0, 3) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<User />}
        title={`Welcome back, ${user.name}`}
        backLink="/doctors"
        backLabel="Find Doctors"
      />

      {/* Emergency Dashboard - Always visible for patients */}
      <PatientEmergencyDashboard user={user} />

      {/* Patient Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-emerald-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button asChild className="h-auto py-4 px-6 flex-col bg-emerald-600 hover:bg-emerald-700">
                <Link href="/doctors">
                  <Calendar className="h-8 w-8 mb-2" />
                  <span className="font-medium">Book Appointment</span>
                  <span className="text-xs opacity-75">Find & schedule with doctors</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4 px-6 flex-col border-blue-500/50 text-blue-400">
                <Link href="/appointments">
                  <Clock className="h-8 w-8 mb-2" />
                  <span className="font-medium">My Appointments</span>
                  <span className="text-xs opacity-75">View scheduled visits</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4 px-6 flex-col border-purple-500/50 text-purple-400">
                <Link href="/medical-history">
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="font-medium">Medical Records</span>
                  <span className="text-xs opacity-75">View health history</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4 px-6 flex-col border-orange-500/50 text-orange-400">
                <Link href="/payment-history">
                  <CreditCard className="h-8 w-8 mb-2" />
                  <span className="font-medium">Payments</span>
                  <span className="text-xs opacity-75">Billing & transactions</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Stats */}
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
              Your Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Total Appointments</span>
              <span className="text-lg font-semibold text-white">{appointments?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Upcoming</span>
              <span className="text-lg font-semibold text-emerald-400">{upcomingAppointments.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">KYC Status</span>
              <span className={`text-sm font-medium ${user.kycVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                {user.kycVerified ? '✓ Verified' : 'Pending'}
              </span>
            </div>
            {!user.kycVerified && (
              <Button size="sm" variant="outline" className="w-full border-yellow-500/50 text-yellow-400">
                Complete KYC
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
                Upcoming Appointments
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/appointments">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="PATIENT"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Tips Section */}
      <Card className="border-emerald-900/20 mt-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-400" />
            Health Tips for Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <h4 className="font-medium text-blue-400 mb-2">💧 Stay Hydrated</h4>
              <p className="text-sm text-gray-300">Drink at least 8 glasses of water daily to maintain optimal health.</p>
            </div>
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <h4 className="font-medium text-green-400 mb-2">🚶 Daily Exercise</h4>
              <p className="text-sm text-gray-300">30 minutes of light exercise can improve your cardiovascular health.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}