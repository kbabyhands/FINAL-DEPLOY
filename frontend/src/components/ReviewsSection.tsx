
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

interface ReviewsSectionProps {
  menuItemId: string;
  menuItemTitle: string;
}

const ReviewsSection = ({ menuItemId, menuItemTitle }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [menuItemId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_item_reviews')
        .select('*')
        .eq('menu_item_id', menuItemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      setTotalReviews(data?.length || 0);
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }
    } catch (error: any) {
      toast({
        title: "Error loading reviews",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    loadReviews();
    toast({
      title: "Review submitted",
      description: "Thank you for your feedback!",
    });
  };

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-light text-amber-900 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            Customer Reviews
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(averageRating, "md")}
              <span className="font-semibold text-lg text-amber-900">
                {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
              </span>
            </div>
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReviewForm(true)}
          className="bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 rounded-xl font-medium"
        >
          Write a Review
        </Button>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          menuItemId={menuItemId}
          menuItemTitle={menuItemTitle}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmitted}
        />
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-white/80 border-amber-200 rounded-xl shadow-sm border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="font-medium text-sm text-amber-900">{review.customer_name}</span>
                    </div>
                    <p className="text-xs text-amber-600">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-2 leading-relaxed">{review.review_text}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">No reviews yet. Be the first to review this item!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
