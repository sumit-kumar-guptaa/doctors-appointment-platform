'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { createDoctorAvailabilitySlots } from '@/actions/create-doctor-slots';
import { toast } from 'sonner';

export default function CreateSlotsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreateSlots = async () => {
    setLoading(true);
    try {
      const response = await createDoctorAvailabilitySlots();
      setResult(response);
      toast.success(`Successfully created ${response.slotsCreated} availability slots for ${response.doctor.name}!`);
    } catch (error) {
      console.error('Error creating slots:', error);
      toast.error('Failed to create availability slots: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-orange-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Doctor Availability Management</h1>
          <p className="text-gray-300">Create and manage availability slots for doctors</p>
        </div>

        <div className="grid gap-6">
          {/* Create Slots Card */}
          <Card className="border-purple-900/30 bg-gradient-to-br from-purple-950/50 to-transparent">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Create Dr. Sumit's Availability Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-gray-300">
                <p className="mb-4">This will create availability slots for Dr. Sumit with the following schedule:</p>
                <div className="bg-purple-900/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span><strong>Morning:</strong> 9:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span><strong>Evening:</strong> 2:00 PM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-orange-900/30 text-orange-200">
                      30-minute slots
                    </Badge>
                    <Badge variant="secondary" className="bg-green-900/30 text-green-200">
                      10 days
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-900/30 text-blue-200">
                      Excluding Sundays
                    </Badge>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateSlots} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold py-3 h-12"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Slots...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Create Availability Slots</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {result && (
            <Card className="border-green-900/30 bg-gradient-to-br from-green-950/50 to-transparent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Slots Created Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-green-400" />
                      <span className="text-green-200 font-medium">Doctor Information</span>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p><strong>Name:</strong> {result.doctor.name}</p>
                      <p><strong>Specialty:</strong> {result.doctor.specialty}</p>
                      <p><strong>Doctor ID:</strong> {result.doctor.id}</p>
                    </div>
                  </div>

                  <div className="bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="text-green-200 font-medium">Schedule Details</span>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p><strong>Morning:</strong> {result.schedule.morning}</p>
                      <p><strong>Evening:</strong> {result.schedule.evening}</p>
                      <p><strong>Slot Duration:</strong> {result.schedule.slotDuration}</p>
                      <p><strong>Days Generated:</strong> {result.schedule.daysGenerated}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-green-900/30 text-green-200 px-4 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-semibold">{result.slotsCreated} slots created successfully!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}