import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Save, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface TimeSlot {
  id?: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DayAvailability {
  day_of_week: number;
  day_name: string;
  is_enabled: boolean;
  time_slots: TimeSlot[];
}

const DAYS_OF_WEEK = [
  { value: 1, name: 'Monday' },
  { value: 2, name: 'Tuesday' },
  { value: 3, name: 'Wednesday' },
  { value: 4, name: 'Thursday' },
  { value: 5, name: 'Friday' },
  { value: 6, name: 'Saturday' },
  { value: 0, name: 'Sunday' },
];

// Comprehensive list of common timezones
const TIMEZONES = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  
  // North America
  { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
  { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
  { value: 'America/Phoenix', label: 'Mountain Time (MST) - Phoenix' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT) - Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST) - Honolulu' },
  { value: 'America/Toronto', label: 'Eastern Time - Toronto' },
  { value: 'America/Vancouver', label: 'Pacific Time - Vancouver' },
  { value: 'America/Mexico_City', label: 'Central Time - Mexico City' },
  
  // Europe
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London' },
  { value: 'Europe/Paris', label: 'Central European Time (CET) - Paris' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET) - Berlin' },
  { value: 'Europe/Rome', label: 'Central European Time (CET) - Rome' },
  { value: 'Europe/Madrid', label: 'Central European Time (CET) - Madrid' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (CET) - Amsterdam' },
  { value: 'Europe/Stockholm', label: 'Central European Time (CET) - Stockholm' },
  { value: 'Europe/Vienna', label: 'Central European Time (CET) - Vienna' },
  { value: 'Europe/Prague', label: 'Central European Time (CET) - Prague' },
  { value: 'Europe/Warsaw', label: 'Central European Time (CET) - Warsaw' },
  { value: 'Europe/Athens', label: 'Eastern European Time (EET) - Athens' },
  { value: 'Europe/Helsinki', label: 'Eastern European Time (EET) - Helsinki' },
  { value: 'Europe/Moscow', label: 'Moscow Time (MSK) - Moscow' },
  { value: 'Europe/Dublin', label: 'Greenwich Mean Time (GMT) - Dublin' },
  { value: 'Europe/Lisbon', label: 'Western European Time (WET) - Lisbon' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
  { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT) - Karachi' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Mumbai, New Delhi' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST) - Dhaka' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (ICT) - Bangkok' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT) - Singapore' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT) - Hong Kong' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST) - Shanghai, Beijing' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (KST) - Seoul' },
  { value: 'Asia/Manila', label: 'Philippine Time (PHT) - Manila' },
  { value: 'Asia/Jakarta', label: 'Western Indonesia Time (WIB) - Jakarta' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Indochina Time (ICT) - Ho Chi Minh City' },
  
  // Australia & Oceania
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET) - Sydney, Melbourne' },
  { value: 'Australia/Brisbane', label: 'Australian Eastern Standard Time (AEST) - Brisbane' },
  { value: 'Australia/Adelaide', label: 'Australian Central Time (ACT) - Adelaide' },
  { value: 'Australia/Perth', label: 'Australian Western Time (AWT) - Perth' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST) - Auckland' },
  
  // South America
  { value: 'America/Sao_Paulo', label: 'Brasilia Time (BRT) - São Paulo' },
  { value: 'America/Buenos_Aires', label: 'Argentina Time (ART) - Buenos Aires' },
  { value: 'America/Lima', label: 'Peru Time (PET) - Lima' },
  { value: 'America/Bogota', label: 'Colombia Time (COT) - Bogotá' },
  { value: 'America/Santiago', label: 'Chile Time (CLT) - Santiago' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Eastern European Time (EET) - Cairo' },
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST) - Johannesburg' },
  { value: 'Africa/Lagos', label: 'West Africa Time (WAT) - Lagos' },
  { value: 'Africa/Nairobi', label: 'East Africa Time (EAT) - Nairobi' },
  
  // Middle East
  { value: 'Asia/Riyadh', label: 'Arabia Standard Time (AST) - Riyadh' },
  { value: 'Asia/Tehran', label: 'Iran Standard Time (IRST) - Tehran' },
  { value: 'Asia/Jerusalem', label: 'Israel Standard Time (IST) - Jerusalem' },
];

export const TherapistAvailabilityCalendar = ({ therapistId }: { therapistId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS_OF_WEEK.map(day => ({
      day_of_week: day.value,
      day_name: day.name,
      is_enabled: false,
      time_slots: []
    }))
  );
  const [timezone, setTimezone] = useState('UTC');
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [therapistId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', therapistId);

      if (error) throw error;

      // Group by day of week
      const groupedAvailability = DAYS_OF_WEEK.map(day => {
        const daySlots = data?.filter(slot => slot.day_of_week === day.value) || [];
        return {
          day_of_week: day.value,
          day_name: day.name,
          is_enabled: daySlots.length > 0,
          time_slots: daySlots.map(slot => ({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: slot.is_available
          }))
        };
      });

      setAvailability(groupedAvailability);
      if (data && data.length > 0) {
        setTimezone(data[0].timezone || 'UTC');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load availability data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            is_enabled: !day.is_enabled,
            time_slots: !day.is_enabled ? [{ start_time: '09:00', end_time: '17:00', is_available: true }] : []
          }
        : day
    ));
  };

  const addTimeSlot = (dayIndex: number) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            time_slots: [...day.time_slots, { start_time: '09:00', end_time: '17:00', is_available: true }]
          }
        : day
    ));
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            time_slots: day.time_slots.filter((_, i) => i !== slotIndex)
          }
        : day
    ));
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string | boolean) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            time_slots: day.time_slots.map((slot, i) => 
              i === slotIndex ? { ...slot, [field]: value } : slot
            )
          }
        : day
    ));
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // First, delete existing availability for this therapist
      const { error: deleteError } = await supabase
        .from('therapist_availability')
        .delete()
        .eq('therapist_id', therapistId);

      if (deleteError) throw deleteError;

      // Prepare new availability records
      const availabilityRecords = [];
      for (const day of availability) {
        if (day.is_enabled && day.time_slots.length > 0) {
          for (const slot of day.time_slots) {
            availabilityRecords.push({
              therapist_id: therapistId,
              day_of_week: day.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_available: slot.is_available,
              timezone: timezone
            });
          }
        }
      }

      // Insert new availability records
      if (availabilityRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('therapist_availability')
          .insert(availabilityRecords);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Availability updated successfully!",
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save availability.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading availability...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Weekly Availability
        </CardTitle>
        <CardDescription>
          Set your available time slots for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timezone Selection */}
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={timezoneOpen}
                className="w-full justify-between"
              >
                {timezone
                  ? TIMEZONES.find((tz) => tz.value === timezone)?.label
                  : "Select timezone..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search timezone..." />
                <CommandList>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup>
                    {TIMEZONES.map((tz) => (
                      <CommandItem
                        key={tz.value}
                        value={`${tz.value} ${tz.label}`}
                        onSelect={() => {
                          setTimezone(tz.value);
                          setTimezoneOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            timezone === tz.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tz.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Days of Week */}
        <div className="space-y-4">
          {availability.map((day, dayIndex) => (
            <div key={day.day_of_week} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={day.is_enabled}
                    onCheckedChange={() => toggleDay(dayIndex)}
                  />
                  <Label className="text-base font-medium">{day.day_name}</Label>
                </div>
                {day.is_enabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addTimeSlot(dayIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                )}
              </div>

              {day.is_enabled && (
                <div className="space-y-2 ml-6">
                  {day.time_slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start_time', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end_time', e.target.value)}
                          className="w-32"
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={slot.is_available}
                            onCheckedChange={(checked) => updateTimeSlot(dayIndex, slotIndex, 'is_available', checked)}
                          />
                          <Label className="text-sm">Available</Label>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {day.time_slots.length === 0 && day.is_enabled && (
                    <p className="text-sm text-muted-foreground ml-3">
                      Click "Add Time Slot" to set your availability for {day.day_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveAvailability} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};