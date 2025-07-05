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

const ViewerToggle = ({ splatUrl, imageUrl, title, performanceMode }: ViewerToggleProps) => {
  const [is3DMode, setIs3DMode] = useState(Boolean(splatUrl?.trim()));

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
  };

  return (
    <div className="space-y-4">
      {is3DMode && splatUrl && splatUrl.trim() ? (
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
          <span className="text-muted-foreground text-lg font-medium">No Preview Available</span>
        </div>
      )}
      {splatUrl && splatUrl.trim() && (
        <Button
          onClick={toggle3DMode}
          variant="outline"
          className="w-full"
        >
          {is3DMode ? (
            <>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Image
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              {performanceMode ? 'View in 3D (Performance Mode)' : 'View in 3D'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ViewerToggle;