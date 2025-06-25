// components/stages/KeywordInput.tsx
import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle, Globe, Map, Target } from 'lucide-react';

interface KeywordInputProps {
  onSubmit: (keyword: string, website?: string) => void;
  onTopicalMapMode: () => void;
  isLoading: boolean;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({ onSubmit, onTopicalMapMode, isLoading }) => {
  const [keyword, setKeyword] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');

  const validateKeyword = (value: string): boolean => {
    if (value.trim().length < 3) {
      setError('Keyword must be at least 3 characters long');
      return false;
    }
    if (value.trim().length > 100) {
      setError('Keyword must be less than 100 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateKeyword(keyword)) {
      onSubmit(keyword.trim(), website.trim() || undefined);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    if (error) validateKeyword(value);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Content Generator
              </h1>
              
              <p className="text-lg text-gray-300 max-w-lg mx-auto mb-6">
                Choose your content creation approach: generate single-keyword content or build topical authority with location-based strategies.
              </p>

              {/* Mode Selection */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
                <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/30 transition-all">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Single Keyword</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Generate comprehensive content for one specific keyword
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onTopicalMapMode}
                  className="flex-1 p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-center">
                    <Map className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Topical Authority</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Build local SEO dominance with strategic keyword mapping
                    </p>
                    <div className="inline-flex items-center text-purple-300 text-sm font-medium">
                      Try Topical Maps →
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                
                <input
                  type="text"
                  value={keyword}
                  onChange={handleChange}
                  placeholder="Enter your keyword or topic..."
                  className={`
                    w-full pl-12 pr-4 py-4 text-lg text-white
                    bg-white/5 backdrop-blur-xl
                    border-2 rounded-xl
                    placeholder-gray-400
                    focus:outline-none focus:ring-4 focus:ring-primary/20
                    transition-all duration-300
                    ${error 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-white/10 focus:border-primary hover:border-white/20'
                    }
                  `}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Client website URL (optional)..."
                  className="
                    w-full pl-12 pr-4 py-4 text-lg text-white
                    bg-white/5 backdrop-blur-xl
                    border-2 rounded-xl
                    placeholder-gray-400
                    focus:outline-none focus:ring-4 focus:ring-primary/20
                    transition-all duration-300
                    border-white/10 focus:border-primary hover:border-white/20
                  "
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !keyword.trim()}
                className={`
                  w-full py-4 px-6 text-lg font-medium rounded-xl
                  transition-all duration-300 transform
                  ${isLoading || !keyword.trim()
                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Starting Research...
                  </span>
                ) : (
                  'Generate Content'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Examples: "sustainable fashion", "AI in healthcare", "remote work productivity"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};