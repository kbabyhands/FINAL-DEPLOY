import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PlayCanvasViewer from "@/components/PlayCanvasViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  model_url?: string;
  image_url?: string;
}

const MenuItemViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("id, title, description, price, model_url, image_url")
          .eq("id", id)
          .single();

        if (error) throw error;
        setMenuItem(data);
      } catch (error) {
        console.error("Error fetching menu item:", error);
        toast({
          title: "Error",
          description: "Failed to load menu item",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id, navigate, toast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!menuItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Menu item not found</h2>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{menuItem.title}</h1>
            {menuItem.description && (
              <p className="text-lg text-muted-foreground mb-2">
                {menuItem.description}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">
              ${menuItem.price.toFixed(2)}
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">3D Model Viewer</h2>
            <div className="w-full h-96 rounded-lg overflow-hidden">
              {menuItem.model_url ? (
                <PlayCanvasViewer
                  splatUrl={menuItem.model_url}
                  className="h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground">No 3D model available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This item doesn't have a 3D model to display
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemViewer;