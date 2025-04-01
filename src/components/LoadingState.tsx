import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Network } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const LoadingState: React.FC = () => {
  const [progress, setProgress] = useState(13);

  // Simulate progress increase
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 100;
        }
        return prevProgress + Math.floor(Math.random() * 10) + 5;
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <Card className="w-full h-[400px] flex items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <BookOpen className="h-16 w-16 text-gray-200 animate-pulse" />
          <Network className="h-10 w-10 text-blue-500 absolute top-5 right-0 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Loader2 className="h-8 w-8 text-gray-500 absolute bottom-0 right-2 animate-spin" />
        </div>
        <h3 className="mt-6 font-semibold text-xl">Analyzing Book Characters</h3>
        <p className="text-gray-500 text-center mt-2 mb-4">
          Processing character relationships and building the network graph...
        </p>
        
        <div className="w-full max-w-md">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-400 text-right mt-1">{progress}%</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;