'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Trash2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? 'AM' : 'PM';
  return {
    value: time,
    label: `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  };
});

export default function DoctorScheduleManager({ doctorId, initialSchedule = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduleTemplates, setScheduleTemplates] = useState([]);
  const [customSchedule, setCustomSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Initialize schedule templates for weekly recurring slots
  useEffect(() => {
    const defaultTemplate = DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      dayLabel: day.label,
      isActive: day.value !== 0, // Exclude Sunday by default
      timeSlots: day.value !== 0 ? [
        { startTime: '09:00', endTime: '12:00', slotDuration: 30 },
        { startTime: '14:00', endTime: '18:00', slotDuration: 30 }
      ] : []
    }));
    setScheduleTemplates(defaultTemplate);
  }, []);

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

  // Generate time slots for a specific day
  const generateTimeSlotsForDay = (date, template) => {
    const dayOfWeek = date.getDay();
    const dayTemplate = scheduleTemplates.find(t => t.dayOfWeek === dayOfWeek);
    
    if (!dayTemplate || !dayTemplate.isActive) return [];
    
    const slots = [];
    dayTemplate.timeSlots.forEach(timeSlot => {
      const startHour = parseInt(timeSlot.startTime.split(':')[0]);
      const startMinute = parseInt(timeSlot.startTime.split(':')[1]);
      const endHour = parseInt(timeSlot.endTime.split(':')[0]);
      const endMinute = parseInt(timeSlot.endTime.split(':')[1]);
      
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      let currentSlot = new Date(startTime);
      
      while (currentSlot < endTime) {
        const slotEnd = new Date(currentSlot);
        slotEnd.setMinutes(slotEnd.getMinutes() + timeSlot.slotDuration);
        
        if (slotEnd <= endTime) {
          slots.push({
            startTime: new Date(currentSlot),
            endTime: new Date(slotEnd),
            status: 'AVAILABLE'
          });
        }
        
        currentSlot.setMinutes(currentSlot.getMinutes() + timeSlot.slotDuration);
      }
    });
    
    return slots;
  };

  // Update schedule template
  const updateScheduleTemplate = (dayOfWeek, updates) => {
    setScheduleTemplates(prev => prev.map(template => 
      template.dayOfWeek === dayOfWeek 
        ? { ...template, ...updates }
        : template
    ));
  };

  // Add time slot to a day template
  const addTimeSlot = (dayOfWeek) => {
    updateScheduleTemplate(dayOfWeek, {
      timeSlots: [
        ...scheduleTemplates.find(t => t.dayOfWeek === dayOfWeek).timeSlots,
        { startTime: '09:00', endTime: '17:00', slotDuration: 30 }
      ]
    });
  };

  // Remove time slot from a day template
  const removeTimeSlot = (dayOfWeek, index) => {
    const template = scheduleTemplates.find(t => t.dayOfWeek === dayOfWeek);
    updateScheduleTemplate(dayOfWeek, {
      timeSlots: template.timeSlots.filter((_, i) => i !== index)
    });
  };

  // Update time slot
  const updateTimeSlot = (dayOfWeek, slotIndex, field, value) => {
    const template = scheduleTemplates.find(t => t.dayOfWeek === dayOfWeek);
    const updatedSlots = template.timeSlots.map((slot, index) => 
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    updateScheduleTemplate(dayOfWeek, { timeSlots: updatedSlots });
  };

  // Generate slots for next 30 days based on templates
  const generateAllSlots = async () => {
    setLoading(true);
    try {
      const slots = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const daySlots = generateTimeSlotsForDay(date);
        slots.push(...daySlots);
      }
      
      // Here you would call your API to save the slots
      await saveScheduleToDatabase(slots);
      toast.success(`Generated ${slots.length} availability slots for the next 30 days!`);
      
    } catch (error) {
      toast.error('Failed to generate schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Save schedule to database (placeholder)
  const saveScheduleToDatabase = async (slots) => {
    // This would be your API call to save slots
    const response = await fetch('/api/doctor/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save schedule');
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-950/30 to-orange-950/30 min-h-screen">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly Schedule Template */}
        <Card className="border-purple-900/30 bg-gradient-to-br from-purple-950/50 to-transparent">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Weekly Schedule Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleTemplates.map((template) => (
              <div key={template.dayOfWeek} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={template.isActive}
                      onChange={(e) => updateScheduleTemplate(template.dayOfWeek, { isActive: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700"
                    />
                    <h3 className="text-white font-medium">{template.dayLabel}</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addTimeSlot(template.dayOfWeek)}
                    disabled={!template.isActive}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {template.isActive && template.timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="bg-purple-900/20 rounded-lg p-3 ml-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <Label className="text-gray-300 text-sm">Start Time</Label>
                        <Select
                          value={slot.startTime}
                          onValueChange={(value) => updateTimeSlot(template.dayOfWeek, slotIndex, 'startTime', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm">End Time</Label>
                        <Select
                          value={slot.endTime}
                          onValueChange={(value) => updateTimeSlot(template.dayOfWeek, slotIndex, 'endTime', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm">Duration (min)</Label>
                        <Select
                          value={slot.slotDuration.toString()}
                          onValueChange={(value) => updateTimeSlot(template.dayOfWeek, slotIndex, 'slotDuration', parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeTimeSlot(template.dayOfWeek, slotIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={generateAllSlots}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Generate 30-Day Schedule
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Preview */}
        <Card className="border-orange-900/30 bg-gradient-to-br from-orange-950/50 to-transparent">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-400" />
                Schedule Calendar
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="border-orange-600 text-orange-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-orange-200 font-medium min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="border-orange-600 text-orange-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-orange-300 font-medium p-2 text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square" />;
                }

                const dayOfWeek = date.getDay();
                const hasSlots = scheduleTemplates.find(t => t.dayOfWeek === dayOfWeek)?.isActive;
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date().setHours(0, 0, 0, 0);

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    disabled={isPast}
                    className={`
                      aspect-square p-2 text-sm rounded-lg border transition-all
                      ${isPast 
                        ? 'text-gray-500 border-gray-700 cursor-not-allowed'
                        : hasSlots 
                          ? 'text-white border-orange-600 bg-orange-900/20 hover:bg-orange-800/30'
                          : 'text-gray-400 border-gray-600 hover:border-gray-500'
                      }
                      ${isToday ? 'ring-2 ring-orange-400' : ''}
                      ${selectedDate?.toDateString() === date.toDateString() ? 'bg-orange-600 text-white' : ''}
                    `}
                  >
                    {date.getDate()}
                    {hasSlots && (
                      <div className="w-1 h-1 bg-orange-400 rounded-full mx-auto mt-1"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-4 p-4 bg-orange-900/20 rounded-lg">
                <h4 className="text-white font-medium mb-2">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h4>
                {(() => {
                  const dayTemplate = scheduleTemplates.find(t => t.dayOfWeek === selectedDate.getDay());
                  if (!dayTemplate?.isActive) {
                    return <p className="text-gray-400 text-sm">No availability on this day</p>;
                  }
                  
                  const slots = generateTimeSlotsForDay(selectedDate);
                  return (
                    <div className="space-y-1">
                      <p className="text-orange-200 text-sm">{slots.length} slots available</p>
                      <div className="flex flex-wrap gap-1">
                        {slots.slice(0, 8).map((slot, index) => (
                          <Badge key={index} variant="outline" className="border-orange-600 text-orange-200 text-xs">
                            {slot.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        ))}
                        {slots.length > 8 && (
                          <Badge variant="outline" className="border-orange-600 text-orange-200 text-xs">
                            +{slots.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}