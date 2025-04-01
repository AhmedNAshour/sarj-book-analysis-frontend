import React from 'react';
import { BookOpen, Network } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full h-[400px] flex items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <BookOpen className="h-16 w-16 text-gray-200 animate-pulse" />
          <Network className="h-10 w-10 text-blue-500 absolute top-5 right-0 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <h3 className="mt-6 font-semibold text-xl">Analyzing Book Characters</h3>
        <p className="text-gray-500 text-center mt-2 mb-4">
          Processing character relationships and building the network graph...
        </p>
        
        <div className="w-full max-w-md space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4 mx-auto" />
          <Skeleton className="h-2 w-1/2 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;