import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: SessionReview) => Promise<void>;
  sessionId: string;
  therapistName: string;
  existingReview?: SessionReview | null;
}

export interface SessionReview {
  overall_rating: number;
  usefulness_rating: number;
  communication_rating: number;
  would_recommend: boolean;
  what_went_well: string;
  what_can_be_improved: string;
}

const SessionReviewModal: React.FC<SessionReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sessionId,
  therapistName,
  existingReview,
}) => {
  const [overallRating, setOverallRating] = useState(0);
  const [usefulnessRating, setUsefulnessRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatCanBeImproved, setWhatCanBeImproved] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with existing review data when modal opens
  useEffect(() => {
    if (isOpen && existingReview) {
      setOverallRating(existingReview.overall_rating || 0);
      setUsefulnessRating(existingReview.usefulness_rating || 0);
      setCommunicationRating(existingReview.communication_rating || 0);
      setWouldRecommend(existingReview.would_recommend ?? true);
      setWhatWentWell(existingReview.what_went_well || "");
      setWhatCanBeImproved(existingReview.what_can_be_improved || "");
    } else if (isOpen && !existingReview) {
      // Reset form for new review
      setOverallRating(0);
      setUsefulnessRating(0);
      setCommunicationRating(0);
      setWouldRecommend(true);
      setWhatWentWell("");
      setWhatCanBeImproved("");
    }
  }, [isOpen, existingReview]);

  const handleSubmit = async () => {
    if (overallRating === 0 || usefulnessRating === 0 || communicationRating === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        overall_rating: overallRating,
        usefulness_rating: usefulnessRating,
        communication_rating: communicationRating,
        would_recommend: wouldRecommend,
        what_went_well: whatWentWell.trim(),
        what_can_be_improved: whatCanBeImproved.trim(),
      });
      // Reset form
      setOverallRating(0);
      setUsefulnessRating(0);
      setCommunicationRating(0);
      setWouldRecommend(true);
      setWhatWentWell("");
      setWhatCanBeImproved("");
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
    label,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={cn(
              "transition-colors hover:scale-110",
              rating >= star ? "text-yellow-400" : "text-gray-300"
            )}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Edit Review' : 'Review Session'} with {therapistName}
          </DialogTitle>
          <DialogDescription>
            {existingReview 
              ? "Update your feedback about this therapy session."
              : "Please share your feedback about this therapy session."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            rating={overallRating}
            onRatingChange={setOverallRating}
            label="Overall Rating *"
          />

          <StarRating
            rating={usefulnessRating}
            onRatingChange={setUsefulnessRating}
            label="How useful was the session? *"
          />

          <StarRating
            rating={communicationRating}
            onRatingChange={setCommunicationRating}
            label="How was therapist's communication? *"
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Do you recommend this therapist? *</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={wouldRecommend ? "default" : "outline"}
                onClick={() => setWouldRecommend(true)}
                className="flex-1"
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!wouldRecommend ? "default" : "outline"}
                onClick={() => setWouldRecommend(false)}
                className="flex-1"
              >
                No
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatWentWell" className="text-sm font-medium">
              What went well during the session?
            </Label>
            <Textarea
              id="whatWentWell"
              placeholder="Share what you found helpful or positive about the session..."
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatCanBeImproved" className="text-sm font-medium">
              What can be improved?
            </Label>
            <Textarea
              id="whatCanBeImproved"
              placeholder="Share any suggestions for improvement..."
              value={whatCanBeImproved}
              onChange={(e) => setWhatCanBeImproved(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              overallRating === 0 ||
              usefulnessRating === 0 ||
              communicationRating === 0
            }
          >
            {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionReviewModal;

