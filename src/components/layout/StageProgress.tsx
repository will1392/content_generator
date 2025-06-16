// components/layout/StageProgress.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface StageProgressProps {
  currentStage: string;
}

const stages = [
  { id: 'research', name: 'Research' },
  { id: 'blog', name: 'Blog' },
  { id: 'podcast_script', name: 'Podcast' },
  { id: 'audio', name: 'Audio' },
  { id: 'images', name: 'Images' },
  { id: 'social', name: 'Social' },
  { id: 'complete', name: 'Complete' },
];

export const StageProgress: React.FC<StageProgressProps> = ({ currentStage }) => {
  const currentIndex = stages.findIndex(s => s.id === currentStage);
  
  return (
    <div className="backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = stage.id === currentStage;
            
            return (
              <React.Fragment key={stage.id}>
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-300 transform
                      ${isComplete 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-110 shadow-lg shadow-green-500/25' 
                        : isCurrent 
                          ? 'bg-gradient-to-br from-primary to-secondary text-white scale-110 shadow-lg shadow-primary/25 animate-pulse' 
                          : 'bg-white/10 text-gray-500 backdrop-blur-xl border border-white/20'
                      }
                    `}
                  >
                    {isComplete ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`
                    ml-3 text-sm font-medium transition-colors
                    ${isCurrent ? 'text-white' : isComplete ? 'text-green-400' : 'text-gray-400'}
                  `}>
                    {stage.name}
                  </span>
                </div>
                
                {index < stages.length - 1 && (
                  <div className="flex-1 mx-4 relative">
                    <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`
                          h-full transition-all duration-500
                          ${isComplete 
                            ? 'bg-gradient-to-r from-green-400 to-green-600 w-full' 
                            : 'w-0'
                          }
                        `}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};