import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaymentIntegration from "@/components/therapist/PaymentIntegration";
import { BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  question_type: string;
  level: string;
  price: number;
  num_reviews: number;
  average_review: number;
}

interface LessonPurchaseModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LessonPurchaseModal = ({ lesson, isOpen, onClose, onSuccess }: LessonPurchaseModalProps) => {
  const [step, setStep] = useState(1);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  const handlePurchase = async () => {
    // Create a purchase record or use lesson ID as identifier
    // For now, we'll use lesson ID as the purchase identifier
    setPurchaseId(lesson.id);
    setStep(2); // Move to payment step
  };

  const handlePaymentSuccess = () => {
    onSuccess();
    onClose();
    // Reset state
    setStep(1);
    setPurchaseId(null);
  };

  const handleCancel = () => {
    setStep(1);
    setPurchaseId(null);
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Lesson</h3>
        
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{lesson.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {lesson.question_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            
            {lesson.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Description:</span>
                <p className="text-sm mt-1">{lesson.description}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-muted-foreground">Level:</span>
              <span className="font-medium capitalize">{lesson.level}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price:</span>
              <span className="text-2xl font-bold text-primary">${lesson.price.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handlePurchase} className="flex-1">
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Complete Payment</h3>
      <p className="text-muted-foreground">
        Complete your payment to purchase "{lesson.name}".
      </p>
      
      {purchaseId && (
        <PaymentIntegration
          sessionId={purchaseId}
          amount={lesson.price}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setStep(1)}
          type="lesson"
          description={`Lesson Purchase: ${lesson.name}`}
        />
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Purchase Lesson: {lesson.name}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </DialogContent>
    </Dialog>
  );
};

export default LessonPurchaseModal;

