
import React from 'react';

interface SplineViewerProps {
  splineUrl: string;
  className?: string;
}

const SplineViewer = ({ splineUrl, className = "" }: SplineViewerProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <iframe
        src={splineUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        className="rounded-lg"
        title="3D Model Viewer"
      />
    </div>
  );
};

export default SplineViewer;
