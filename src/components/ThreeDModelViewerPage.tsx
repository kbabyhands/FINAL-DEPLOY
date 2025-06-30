
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import ModelFileUpload from './ModelFileUpload';
import ThreeDModelViewer from './ThreeDModelViewer';
import { ProcessedFile } from '@/utils/fileProcessor';

export const ThreeDModelViewerPage = () => {
  const [currentFile, setCurrentFile] = useState<ProcessedFile | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFileProcessed = (file: ProcessedFile) => {
    setCurrentFile(file);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen && currentFile) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="relative w-full h-full">
          <ThreeDModelViewer 
            modelData={currentFile.data}
            filename={currentFile.filename}
            type={currentFile.type}
          />
          <Button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4"
            variant="secondary"
          >
            Exit Fullscreen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">3D Model Viewer</h1>
        <p className="text-gray-600">
          Upload and view PLY files, Gaussian splats, and compressed 3D models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Upload 3D Model
                <Badge variant="outline">Beta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModelFileUpload onFileProcessed={handleFileProcessed} />
            </CardContent>
          </Card>
        </div>

        {/* Viewer Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                3D Viewer
                {currentFile && (
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleFullscreen}
                      variant="outline"
                      size="sm"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Fullscreen
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentFile ? (
                <div className="space-y-4">
                  <div className="relative">
                    <ThreeDModelViewer 
                      modelData={currentFile.data}
                      filename={currentFile.filename}
                      type={currentFile.type}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Move className="w-3 h-3" />
                      <span>Drag to rotate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" />
                      <span>Scroll to zoom</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      <span>Click model to toggle auto-rotate</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>Upload a 3D model to get started</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Supported File Types:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>.ply</strong> - Standard polygon files</li>
                <li>• <strong>.ply.gz</strong> - Compressed PLY files</li>
                <li>• <strong>.zip</strong> - Archives with PLY files inside</li>
                <li>• <strong>.splat</strong> - Gaussian splat files</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Viewer Controls:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Mouse drag:</strong> Rotate the model</li>
                <li>• <strong>Mouse wheel:</strong> Zoom in/out</li>
                <li>• <strong>Right drag:</strong> Pan the view</li>
                <li>• <strong>Click model:</strong> Toggle auto-rotation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreeDModelViewerPage;
