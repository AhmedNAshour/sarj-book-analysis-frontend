import React, { useState, useEffect } from 'react';
import { BookOpen, Network } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const wittyLoadingMessages = [
  "Interviewing fictional characters about their motivations...",
  "Tracking character relationships better than a literature professor...",
  "Measuring dramatic tension with fictional tension-meters...",
  "Reading between the lines so you don't have to...",
  "Finding subtext hidden in plain text...",
  "Calculating the exact distance between star-crossed lovers...",
  "Mapping character journeys without GPS...",
  "Untangling complicated plot threads...",
  "Decoding author intentions without a literary Enigma machine...",
  "Scanning for foreshadowing at the speed of light...",
  "Teaching AI to appreciate literary irony...",
  "Figuring out who's related to whom in this literary family tree...",
  "Analyzing character arcs more precisely than a protractor...",
  "Determining which characters would be friends on social media...",
  "Psychoanalyzing fictional characters without a license...",
  "Extracting meaning without harming any metaphors...",
  "Diagramming sentences that writers spent hours crafting...",
  "Discovering which characters would survive a horror movie..."
];

const LoadingState: React.FC = () => {
  const [message, setMessage] = useState(wittyLoadingMessages[0]);
  
  useEffect(() => {
    // Change message every 3 seconds
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * wittyLoadingMessages.length);
      setMessage(wittyLoadingMessages[randomIndex]);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="w-full h-[400px] flex items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <BookOpen className="h-16 w-16 text-gray-200 animate-pulse" />
          <Network className="h-10 w-10 text-blue-500 absolute top-5 right-0 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <h3 className="mt-6 font-semibold text-xl">Analyzing Book Characters</h3>
        <p className="text-gray-500 text-center mt-2 mb-4 min-h-[3rem]">
          {message}
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