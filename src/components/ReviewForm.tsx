
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, isValidEmail } from "@/utils/validation";
import { logger } from "@/utils/logger";

interface ReviewFormProps {
  menuItemId: string;
  menuItemTitle: string;
  onClose: () => void;
  onSubmit: () => void;
}

const ReviewForm = ({ menuItemId, menuItemTitle, onClose, onSubmit }: ReviewFormProps) => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    const sanitizedName = sanitizeInput(customerName);
    if (!sanitizedName.trim()) {
      newErrors.customerName = "Name is required";
    } else if (sanitizedName.length > 100) {
      newErrors.customerName = "Name must be less than 100 characters";
    }

    // Email validation (optional but must be valid if provided)
    const sanitizedEmail = sanitizeInput(customerEmail);
    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    // Rating validation
    if (rating === 0) {
      newErrors.rating = "Please provide a rating";
    } else if (rating < 1 || rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5 stars";
    }

    // Review text validation (optional but limited length)
    const sanitizedReview = sanitizeInput(reviewText);
    if (sanitizedReview.length > 1000) {
      newErrors.reviewText = "Review must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      logger.debug('Review form validation failed:', errors);
      return;
    }

    setSubmitting(true);
    logger.debug('Submitting review for menu item:', menuItemId);

    try {
      const sanitizedData = {
        menu_item_id: menuItemId,
        customer_name: sanitizeInput(customerName).trim(),
        customer_email: customerEmail.trim() ? sanitizeInput(customerEmail).trim() : null,
        rating,
        review_text: reviewText.trim() ? sanitizeInput(reviewText).trim() : null,
      };

      const { error } = await supabase
        .from('menu_item_reviews')
        .insert(sanitizedData);

      if (error) {
        logger.error('Error submitting review:', error);
        throw error;
      }

      logger.debug('Review submitted successfully');
      toast({
        title: "Thank you!",
        description: "Your review has been submitted successfully."
      });
      
      onSubmit();
    } catch (error: any) {
      logger.error('Error in review submission:', error);
      toast({
        title: "Error submitting review",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review: {menuItemTitle}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={100}
            />
            {errors.customerName && (
              <p className="text-sm text-red-500">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter your email"
              maxLength={255}
            />
            {errors.customerEmail && (
              <p className="text-sm text-red-500">{errors.customerEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              {renderStarRating()}
              <span className="text-sm text-gray-600 ml-2">
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review (optional)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this menu item..."
              rows={4}
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 text-right">
              {reviewText.length}/1000 characters
            </div>
            {errors.reviewText && (
              <p className="text-sm text-red-500">{errors.reviewText}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
