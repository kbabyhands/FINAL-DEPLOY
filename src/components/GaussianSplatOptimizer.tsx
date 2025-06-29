
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Download, Zap, FileText, AlertTriangle } from 'lucide-react';

interface GaussianSplatOptimizerProps {
  onOptimizationTip: () => void;
}

const GaussianSplatOptimizer = ({ onOptimizationTip }: GaussianSplatOptimizerProps) => {
  const optimizationTips = [
    {
      title: "Use Compressed PLY Files",
      description: "Convert your .splat files to compressed .ply format to reduce file size by 30-50%",
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: "Reduce Point Density",
      description: "Use fewer Gaussian points while maintaining visual quality",
      icon: <Zap className="w-5 h-5" />
    },
    {
      title: "Optimize for Web",
      description: "Use tools like 3D Gaussian Splatting WebGL optimizers",
      icon: <Download className="w-5 h-5" />
    }
  ];

  const handleShowTips = () => {
    onOptimizationTip();
  };

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="w-5 h-5" />
          Gaussian Splat Optimization
        </CardTitle>
        <CardDescription className="text-blue-600">
          Tips to reduce file size and improve upload success
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {optimizationTips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-md border">
            <div className="text-blue-600 mt-0.5">
              {tip.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{tip.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
            </div>
          </div>
        ))}
        
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div className="text-sm text-amber-800">
            <strong>File Size Limit:</strong> Maximum 200MB for Gaussian splat files
          </div>
        </div>
        
        <Button 
          onClick={handleShowTips}
          variant="outline" 
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          View Detailed Optimization Guide
        </Button>
      </CardContent>
    </Card>
  );
};

export default GaussianSplatOptimizer;
