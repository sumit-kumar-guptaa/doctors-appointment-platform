import { getCurrentUser } from "@/actions/onboarding";
import { getPatientAppointments } from "@/actions/patient";
import { AppointmentCard } from "@/components/appointment-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  MapPin,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default async function PatientAppointmentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const { appointments } = await getPatientAppointments();
  
  const upcomingAppointments = appointments?.filter(apt => 
    new Date(apt.scheduledFor) > new Date()
  ) || [];
  
  const pastAppointments = appointments?.filter(apt => 
    new Date(apt.scheduledFor) <= new Date()
  ) || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-600';
      case 'CANCELLED':
        return 'bg-red-600';
      case 'PENDING':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<Calendar />}
        title="My Appointments"
        subtitle="Manage your appointments and medical consultations"
        backLink="/patient"
        backLabel="Back to Dashboard"
      />

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/doctors">
            <Stethoscope className="h-4 w-4 mr-2" />
            Book New Appointment
          </Link>
        </Button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search appointments..." 
            className="pl-10 bg-gray-800/50 border-gray-700"
          />
        </div>
        
        <Button variant="outline" className="border-gray-600">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Appointments Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{appointments?.length || 0}</div>
            <div className="text-sm text-gray-400">Total</div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{upcomingAppointments.length}</div>
            <div className="text-sm text-gray-400">Upcoming</div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{pastAppointments.length}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {appointments?.filter(apt => apt.status === 'PENDING').length || 0}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="border-emerald-900/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
              Upcoming Appointments ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            Dr. {appointment.doctor?.name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {appointment.doctor?.specialization || 'General Practice'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4 mt-3">
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="h-4 w-4 mr-2 text-emerald-400" />
                          {new Date(appointment.scheduledFor).toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <MapPin className="h-4 w-4 mr-2 text-emerald-400" />
                          {appointment.meetingLink ? 'Online Consultation' : 'In-Person Visit'}
                        </div>
                      </div>
                      
                      {appointment.reason && (
                        <div className="mt-3 p-2 bg-gray-700/50 rounded text-sm text-gray-300">
                          <strong>Reason:</strong> {appointment.reason}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(appointment.status)}
                          <span>{appointment.status}</span>
                        </div>
                      </Badge>
                      
                      {appointment.meetingLink && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Join Call
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline" className="border-gray-600">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-400" />
              Past Appointments ({pastAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/20 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-300">
                          Dr. {appointment.doctor?.name || 'Unknown'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.scheduledFor).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-gray-700">
                        {appointment.status}
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {pastAppointments.length > 5 && (
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                  View All Past Appointments ({pastAppointments.length - 5} more)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Appointments */}
      {(!appointments || appointments.length === 0) && (
        <Card className="border-emerald-900/20">
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-white mb-2">No Appointments Yet</h3>
            <p className="text-gray-400 mb-6">
              Book your first appointment with our qualified doctors
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/doctors">
                <Stethoscope className="h-4 w-4 mr-2" />
                Find Doctors
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}