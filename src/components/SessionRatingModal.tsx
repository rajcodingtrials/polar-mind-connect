import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface SessionRatingModalProps {
  sessionId: string;
  onSubmit: (rating: number, feedbackText?: string, categories?: string[], wouldRecommend?: boolean) => Promise<void>;
  onClose: () => void;
}

const SessionRatingModal: React.FC<SessionRatingModalProps> = ({
  sessionId,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackCategories = [
    "Communication",
    "Expertise",
    "Punctuality",
    "Professionalism",
    "Helpfulness",
    "Session Quality"
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, feedbackText || undefined, selectedCategories, wouldRecommend || undefined);
      toast.success("Rating submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Overall Rating</label>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      i < rating 
                        ? 'fill-warning text-warning' 
                        : 'text-muted-foreground hover:text-warning'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Categories */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What went well? (Optional)</label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <label htmlFor={category} className="text-sm">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Text Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments (Optional)</label>
            <Textarea
              placeholder="Share your thoughts about the session..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Would you recommend this therapist? (Optional)</label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={wouldRecommend === true ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(false)}
              >
                No
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === null ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(null)}
              >
                Skip
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionRatingModal;