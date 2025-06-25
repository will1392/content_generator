import React from 'react';
import { 
  Search, 
  FileText, 
  Mic, 
  Volume2, 
  Image, 
  Share2,
  CheckCircle,
  Circle,
  ChevronRight
} from 'lucide-react';
import { ProjectStage } from '../../types/project.types';

interface StageNavigationProps {
  currentStage: ProjectStage;
  latestStage: ProjectStage;
  onNavigate: (stage: ProjectStage) => void;
  canNavigate: (stage: ProjectStage) => boolean;
  stageContent?: Record<string, any>;
}

interface StageInfo {
  id: ProjectStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const stages: StageInfo[] = [
  { id: 'research', label: 'Research', icon: Search },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'podcast_script', label: 'Podcast', icon: Mic },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'social', label: 'Social', icon: Share2 },
];

export const StageNavigation: React.FC<StageNavigationProps> = ({
  currentStage,
  latestStage,
  onNavigate,
  canNavigate,
  stageContent = {},
}) => {
  const currentIndex = stages.findIndex(s => s.id === currentStage);
  const latestIndex = stages.findIndex(s => s.id === latestStage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = stage.id === currentStage;
          const isCompleted = index < latestIndex;
          const isAccessible = canNavigate(stage.id);
          const isLatest = index === latestIndex;
          const hasContent = !!stageContent[stage.id];

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => isAccessible && onNavigate(stage.id)}
                disabled={!isAccessible}
                title={
                  isAccessible 
                    ? hasContent 
                      ? `View ${stage.label.toLowerCase()} content`
                      : `Go to ${stage.label.toLowerCase()}`
                    : `Complete previous stages first`
                }
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-lg transition-all
                  ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'}
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : isAccessible 
                      ? 'hover:bg-gray-50 text-gray-700' 
                      : 'text-gray-400'
                  }
                `}
              >
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                    : hasContent 
                      ? 'bg-green-600 text-white'
                      : isAccessible
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  {hasContent && !isActive ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  
                  {/* Pulse animation for current stage */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-25" />
                  )}
                </div>
                <span className={`
                  text-xs font-medium
                  ${isActive ? 'text-blue-600' : ''}
                `}>
                  {stage.label}
                </span>
              </button>
              
              {index < stages.length - 1 && (
                <ChevronRight className={`
                  w-5 h-5 flex-shrink-0
                  ${index < latestIndex ? 'text-green-600' : 'text-gray-300'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${((latestIndex + 1) / stages.length) * 100}%` }}
        />
      </div>
      
      {/* Helper text */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            Click any stage to view content
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Current stage
          </span>
        </p>
      </div>
    </div>
  );
};