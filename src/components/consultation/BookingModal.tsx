import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock, DollarSign } from "lucide-react";
import { format, addDays, isBefore, startOfDay, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import PaymentIntegration from "./PaymentIntegration";
import { useToast } from "@/hooks/use-toast";

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  hourly_rate_30min: number;
  hourly_rate_60min: number;
  timezone: string;
}

interface BookingModalProps {
  therapist: Therapist;
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TherapistAvailability {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const BookingModal = ({ therapist, isOpen, onClose }: BookingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [sessionType, setSessionType] = useState("consultation");
  const [clientNotes, setClientNotes] = useState("");
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [therapistAvailability, setTherapistAvailability] = useState<TherapistAvailability[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string>();

  const sessionPrice = duration === "30" ? therapist.hourly_rate_30min : therapist.hourly_rate_60min;

  // Fetch therapist's availability schedule
  useEffect(() => {
    const fetchTherapistAvailability = async () => {
      try {
        const { data, error } = await supabase
          .from("therapist_availability")
          .select("*")
          .eq("therapist_id", therapist.id)
          .eq("is_available", true);

        if (error) throw error;
        console.log("Therapist availability:", data);
        setTherapistAvailability(data || []);
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };

    fetchTherapistAvailability();
  }, [therapist.id]);

  // Generate time slots based on therapist's actual availability and existing bookings
  const generateTimeSlotsForDay = async (dayOfWeek: number, date: Date): Promise<TimeSlot[]> => {
    const dayAvailability = therapistAvailability.filter(av => av.day_of_week === dayOfWeek);
    
    if (dayAvailability.length === 0) return [];

    // Fetch existing bookings for this therapist on the selected date
    const { data: existingBookings } = await supabase
      .from("therapy_sessions")
      .select("start_time, end_time, status")
      .eq("therapist_id", therapist.id)
      .eq("session_date", format(date, "yyyy-MM-dd"))
      .in("status", ["pending", "confirmed", "completed"]);

    const bookedSlots = new Set(
      existingBookings?.map(booking => booking.start_time) || []
    );

    const slots: TimeSlot[] = [];
    
    dayAvailability.forEach(availability => {
      const startTime = availability.start_time;
      const endTime = availability.end_time;
      
      // Parse start and end times
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      // Generate 30-minute slots
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const isBooked = bookedSlots.has(time);
        slots.push({ time, available: !isBooked });
      }
    });
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Check if a date is available based on therapist's schedule
  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    return therapistAvailability.some(av => av.day_of_week === dayOfWeek);
  };

  useEffect(() => {
    const loadAvailability = async () => {
      if (selectedDate && therapistAvailability.length > 0) {
        const dayOfWeek = getDay(selectedDate);
        const slots = await generateTimeSlotsForDay(dayOfWeek, selectedDate);
        setAvailability(slots);
      }
    };
    
    loadAvailability();
  }, [selectedDate, therapistAvailability]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isBefore(date, startOfDay(new Date())) && isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTime(""); // Reset selected time when date changes
    }
  };

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedTime) return;

    setIsCreatingSession(true);
    try {
      const { data, error } = await supabase
        .from("therapy_sessions")
        .insert({
          therapist_id: therapist.id,
          client_id: user.id,
          session_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTime,
          end_time: calculateEndTime(selectedTime, parseInt(duration)),
          duration_minutes: parseInt(duration),
          session_type: sessionType,
          client_notes: clientNotes,
          price_paid: sessionPrice,
          status: "pending",
          payment_status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setStep(3); // Move to payment step
      
      toast({
        title: "Session Created",
        description: "Please complete payment to confirm your booking.",
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handlePaymentSuccess = async () => {
    try {
      // Send booking confirmation email to client
      await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          sessionId,
          clientEmail: user?.email || '',
          clientName: user?.user_metadata?.name || user?.email || '',
          therapistName: `${therapist.first_name} ${therapist.last_name}`,
          sessionDate: format(selectedDate, "yyyy-MM-dd"),
          sessionTime: selectedTime,
          duration: parseInt(duration),
          sessionType,
          price: sessionPrice,
        }
      });
      
      console.log("Booking confirmation email sent to client");

      // Send notification email to therapist
      await supabase.functions.invoke('send-therapist-notification', {
        body: {
          sessionId,
          therapistId: therapist.id,
          clientName: user?.user_metadata?.name || user?.email || 'New Client',
          sessionDate: format(selectedDate, "yyyy-MM-dd"),
          sessionTime: selectedTime,
          duration: parseInt(duration),
          sessionType,
          amount: sessionPrice,
          clientNotes: clientNotes,
        }
      });
      
      console.log("Therapist notification email sent");
    } catch (error) {
      console.error("Error sending booking emails:", error);
    }
    
    toast({
      title: "Booking Confirmed!",
      description: "Your therapy session has been booked successfully. Both you and your therapist will receive confirmation emails.",
    });
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => 
                    isBefore(date, startOfDay(new Date())) || 
                    !isDateAvailable(date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {therapist.hourly_rate_30min && (
                  <SelectItem value="30">30 minutes - ${therapist.hourly_rate_30min}</SelectItem>
                )}
                {therapist.hourly_rate_60min && (
                  <SelectItem value="60">60 minutes - ${therapist.hourly_rate_60min}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedDate && availability.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-medium mb-2 block">Available Times</Label>
            <div className="grid grid-cols-4 gap-2">
              {availability.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  className={`text-xs ${!slot.available ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={!slot.available ? "This time slot is already booked" : ""}
                >
                  {slot.time}
                  {!slot.available && <span className="ml-1 text-xs">(booked)</span>}
                </Button>
              ))}
            </div>
            {availability.length === 0 && selectedDate && (
              <p className="text-sm text-muted-foreground">
                No availability on this day. Please select a different date.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="sessionType" className="text-sm font-medium mb-2 block">
          Session Type
        </Label>
        <Select value={sessionType} onValueChange={setSessionType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consultation">Initial Consultation</SelectItem>
            <SelectItem value="therapy">Therapy Session</SelectItem>
            <SelectItem value="assessment">Assessment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any specific concerns or topics you'd like to discuss..."
          value={clientNotes}
          onChange={(e) => setClientNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button
        onClick={() => setStep(2)}
        disabled={!selectedDate || !selectedTime}
        className="w-full"
      >
        Continue to Review
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Booking</h3>
      
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Therapist:</span>
            <span className="font-medium">
              {therapist.first_name} {therapist.last_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {selectedDate && format(selectedDate, "PPP")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session Type:</span>
            <span className="font-medium capitalize">{sessionType}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total:</span>
            <span>${sessionPrice}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleBooking} 
          disabled={isCreatingSession}
          className="flex-1"
        >
          {isCreatingSession ? "Creating..." : "Book Session"}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Complete Payment</h3>
      <p className="text-muted-foreground">
        Complete your payment to confirm the booking with {therapist.first_name} {therapist.last_name}.
      </p>
      
      {sessionId && (
        <PaymentIntegration
          sessionId={sessionId}
          amount={sessionPrice}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setStep(2)}
        />
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Book Session with {therapist.first_name} {therapist.last_name}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;