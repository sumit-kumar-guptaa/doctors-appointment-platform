'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function EnhancedSlotPicker({ doctorId, onSlotSelect, selectedSlot }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Fetch doctor availability
  useEffect(() => {
    fetchDoctorAvailability();
  }, [doctorId, currentMonth]);

  const fetchDoctorAvailability = async () => {
    setLoading(true);
    try {
      // Get first and last day of current month
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await fetch('/api/doctors/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setAvailableSlots(data.slotsByDate || {});
      setDoctorInfo(data.doctor);

    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateSlots = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return availableSlots[dateKey] || [];
  };

  const handleDateSelect = (date) => {
    const slots = getDateSlots(date);
    if (slots.length > 0) {
      setSelectedDate(date);
    }
  };

  const handleSlotSelect = (slot) => {
    onSlotSelect({
      ...slot,
      date: selectedDate,
      formattedDate: formatDate(selectedDate),
      formattedTime: formatTime(slot.startTime)
    });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    setSelectedDate(null); // Reset selected date when changing months
  };

  const calendarDays = generateCalendarDays();
  const selectedDateSlots = selectedDate ? getDateSlots(selectedDate) : [];

  if (loading && Object.keys(availableSlots).length === 0) {
    return (
      <Card className="border-purple-900/30">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="ml-2 text-gray-300">Loading available slots...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card className="border-purple-900/30 bg-gradient-to-br from-purple-950/50 to-transparent">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Select Date
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateMonth(-1)}
                className="border-purple-600 text-purple-200 hover:bg-purple-800/30"
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-purple-200 font-medium min-w-[140px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateMonth(1)}
                className="border-purple-600 text-purple-200 hover:bg-purple-800/30"
                disabled={loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          )}
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-purple-300 font-medium p-2 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="aspect-square" />;
              }

              const dateSlots = getDateSlots(date);
              const hasSlots = dateSlots.length > 0;
              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date().setHours(0, 0, 0, 0);
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={isPast || !hasSlots}
                  className={`
                    aspect-square p-2 text-sm rounded-lg border transition-all relative
                    ${isPast || !hasSlots
                      ? 'text-gray-500 border-gray-700 cursor-not-allowed'
                      : 'text-white border-purple-600 bg-purple-900/20 hover:bg-purple-800/40'
                    }
                    ${isToday ? 'ring-2 ring-purple-400' : ''}
                    ${isSelected ? 'bg-purple-600 text-white border-purple-400' : ''}
                  `}
                >
                  {date.getDate()}
                  {hasSlots && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    </div>
                  )}
                  {hasSlots && !isSelected && (
                    <div className="absolute top-1 right-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0 bg-purple-700 text-purple-200">
                        {dateSlots.length}
                      </Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card className="border-orange-900/30 bg-gradient-to-br from-orange-950/50 to-transparent">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              Available Times for {formatDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateSlots.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No available slots for this date
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedDateSlots.map((slot) => {
                  const isSelectedSlot = selectedSlot?.id === slot.id;
                  
                  return (
                    <Button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      variant={isSelectedSlot ? "default" : "outline"}
                      className={`
                        h-auto py-3 px-4 text-center transition-all
                        ${isSelectedSlot 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-500'
                          : 'border-orange-600 text-orange-200 hover:bg-orange-800/30 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium text-sm">
                          {formatTime(slot.startTime)}
                        </span>
                        <span className="text-xs opacity-80">
                          30 min
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {selectedDateSlots.length > 0 && (
              <div className="mt-4 p-3 bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-orange-200 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{selectedDateSlots.length} slots available</span>
                </div>
                {doctorInfo && (
                  <p className="text-orange-300 text-sm mt-1">
                    Consultation Fee: ${doctorInfo.consultationFee} (2 credits)
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}