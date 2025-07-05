import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, ArrowLeft } from "lucide-react";
import PlayCanvasViewer from "./PlayCanvasViewer";

interface ViewerToggleProps {
  splatUrl?: string;
  imageUrl?: string;
  title: string;
  performanceMode: boolean;
}

/**
 * ViewerToggle Component - Manages switching between image and 3D model views
 * 
 * Features:
 * - Automatic 3D mode detection based on model availability
 * - Performance mode consideration
 * - Accessible toggle button
 * - Fallback for missing media
 */
const ViewerToggle = ({ splatUrl, imageUrl, title, performanceMode }: ViewerToggleProps) => {
  const [is3DMode, setIs3DMode] = useState(Boolean(splatUrl?.trim()));

  /**
   * Toggles between 3D model and image view
   */
  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
  };

  const has3DModel = Boolean(splatUrl?.trim());

  return (
    <div className="space-y-4">
      {/* Media Display Area */}
      {is3DMode && has3DModel ? (
        <div className="w-full h-64 rounded-lg overflow-hidden">
          <PlayCanvasViewer
            splatUrl={splatUrl}
            className="h-full"
            performanceMode={performanceMode}
            lazyLoad={false}
          />
        </div>
      ) : imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-64 object-cover rounded-lg"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-lg">
          <span className="text-muted-foreground text-lg font-medium">
            No Preview Available
          </span>
        </div>
      )}
      
      {/* Toggle Button */}
      {has3DModel && (
        <Button
          onClick={toggle3DMode}
          variant="outline"
          className="w-full"
          aria-label={is3DMode ? 'Switch to image view' : 'Switch to 3D view'}
        >
          {is3DMode ? (
            <>
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Image
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
              {performanceMode ? 'View in 3D (Performance Mode)' : 'View in 3D'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ViewerToggle;