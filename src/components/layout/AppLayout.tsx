// components/layout/AppLayout.tsx
import React from 'react';
import { StageProgress } from './StageProgress';
import { Sparkles } from 'lucide-react';
import { Project } from '../../types/project.types';

interface AppLayoutProps {
  project: Project | null;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  project, 
  children 
}) => {
  return (
    <div className="min-h-screen relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-[#1a0d3d]">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10"></div>
      </div>

      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    AI Content Generator
                  </h1>
                  {project && (
                    <p className="text-sm text-gray-400 mt-1">
                      Project: <span className="text-primary font-medium">{project.keyword}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {project && (
          <StageProgress currentStage={project.status} />
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};