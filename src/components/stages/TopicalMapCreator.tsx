import React, { useState } from 'react';
import { MapPin, AlertCircle, Loader2, Map, Target, TrendingUp } from 'lucide-react';
import { TopicalMapKeyword } from '../../types/project.types';

interface TopicalMapCreatorProps {
  onMapGenerated: (topic: string, location: string, keywords: TopicalMapKeyword[]) => void;
  isLoading: boolean;
}

export const TopicalMapCreator: React.FC<TopicalMapCreatorProps> = ({ 
  onMapGenerated, 
  isLoading 
}) => {
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ topic?: string; location?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { topic?: string; location?: string } = {};
    
    if (topic.trim().length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters long';
    } else if (topic.trim().length > 100) {
      newErrors.topic = 'Topic must be less than 100 characters';
    }
    
    if (location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters long';
    } else if (location.trim().length > 100) {
      newErrors.location = 'Location must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Just pass the inputs to the parent handler
    // The parent will handle AI generation and database saving
    onMapGenerated(topic.trim(), location.trim(), []);
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTopic(value);
    if (errors.topic) {
      setErrors(prev => ({ ...prev, topic: undefined }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: undefined }));
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-lg">
                <Map className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Topical Authority Builder
              </h1>
              
              <p className="text-lg text-gray-300 max-w-lg mx-auto">
                Generate 10 strategic keywords for local SEO domination. Build topical authority 
                with location-specific content that ranks.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Topic Input */}
              <div className="relative group">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Topic or Industry *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Target className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  
                  <input
                    type="text"
                    value={topic}
                    onChange={handleTopicChange}
                    placeholder="e.g., real estate, digital marketing, fitness coaching"
                    className={`
                      w-full pl-12 pr-4 py-4 text-lg text-white
                      bg-white/5 backdrop-blur-xl
                      border-2 rounded-xl
                      placeholder-gray-400
                      focus:outline-none focus:ring-4 focus:ring-purple-500/20
                      transition-all duration-300
                      ${errors.topic 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/10 focus:border-purple-400 hover:border-white/20'
                      }
                    `}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                
                {errors.topic && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.topic}</span>
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div className="relative group">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Target Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="e.g., Miami, San Francisco, Toronto"
                    className={`
                      w-full pl-12 pr-4 py-4 text-lg text-white
                      bg-white/5 backdrop-blur-xl
                      border-2 rounded-xl
                      placeholder-gray-400
                      focus:outline-none focus:ring-4 focus:ring-purple-500/20
                      transition-all duration-300
                      ${errors.location 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/10 focus:border-purple-400 hover:border-white/20'
                      }
                    `}
                    disabled={isLoading}
                  />
                </div>
                
                {errors.location && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.location}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !topic.trim() || !location.trim()}
                className={`
                  w-full py-4 px-6 text-lg font-medium rounded-xl
                  transition-all duration-300 transform
                  ${isLoading || !topic.trim() || !location.trim()
                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Topical Map...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <TrendingUp className="w-5 h-5" />
                    Generate Topical Map
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400 mb-2">
                AI will create 10 strategic keywords covering:
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">Informational</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">Commercial</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full">Transactional</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">Local SEO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};