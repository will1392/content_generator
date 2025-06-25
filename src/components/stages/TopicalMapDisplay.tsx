import React, { useState } from 'react';
import { 
  Map, 
  MapPin, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  Users,
  DollarSign,
  Eye,
  Navigation
} from 'lucide-react';
import { TopicalMap, TopicalMapKeyword } from '../../types/project.types';

interface TopicalMapDisplayProps {
  topicalMap: TopicalMap;
  onCreateContent: (keyword: TopicalMapKeyword) => void;
  onSaveMap: () => void;
  onRegenerateMap: () => void;
  isLoading?: boolean;
}

export const TopicalMapDisplay: React.FC<TopicalMapDisplayProps> = ({
  topicalMap,
  onCreateContent,
  onSaveMap,
  onRegenerateMap,
  isLoading = false
}) => {
  const [filterIntent, setFilterIntent] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'informational': return <Eye className="w-4 h-4" />;
      case 'commercial': return <Users className="w-4 h-4" />;
      case 'transactional': return <DollarSign className="w-4 h-4" />;
      case 'navigational': return <Navigation className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'text-blue-400 bg-blue-500/20';
      case 'commercial': return 'text-green-400 bg-green-500/20';
      case 'transactional': return 'text-yellow-400 bg-yellow-500/20';
      case 'navigational': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredKeywords = topicalMap.keywords.filter(keyword => {
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntent = filterIntent === 'all' || keyword.intent === filterIntent;
    const matchesPriority = filterPriority === 'all' || keyword.priority === filterPriority;
    
    return matchesSearch && matchesIntent && matchesPriority;
  });

  const completionRate = Math.round((topicalMap.completedKeywords / topicalMap.totalKeywords) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
            <Map className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{topicalMap.title}</h1>
            <div className="flex items-center gap-4 text-white/60 mt-1">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{topicalMap.topic}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{topicalMap.location}</span>
              </div>
            </div>
          </div>
        </div>

        {topicalMap.description && (
          <p className="text-white/70 text-lg max-w-3xl">{topicalMap.description}</p>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{topicalMap.totalKeywords}</span>
          </div>
          <p className="text-white/60 text-sm">Total Keywords</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{topicalMap.completedKeywords}</span>
          </div>
          <p className="text-white/60 text-sm">Content Created</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{completionRate}%</span>
          </div>
          <p className="text-white/60 text-sm">Completion Rate</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{topicalMap.totalKeywords - topicalMap.completedKeywords}</span>
          </div>
          <p className="text-white/60 text-sm">Remaining</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 w-full sm:w-64"
              />
            </div>

            {/* Intent Filter */}
            <select
              value={filterIntent}
              onChange={(e) => setFilterIntent(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Intents</option>
              <option value="informational">Informational</option>
              <option value="commercial">Commercial</option>
              <option value="transactional">Transactional</option>
              <option value="navigational">Navigational</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onSaveMap}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors border border-white/20"
            >
              Save Map
            </button>
            <button
              onClick={onRegenerateMap}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 font-medium transition-colors border border-purple-500/30"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Keywords Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredKeywords.map((keyword) => (
          <div
            key={keyword.id}
            className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-200 hover:bg-white/15 ${
              keyword.contentCreated 
                ? 'border-green-500/30 bg-green-500/5' 
                : 'border-white/20'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {keyword.keyword}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Intent Badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(keyword.intent)}`}>
                    {getIntentIcon(keyword.intent)}
                    <span className="capitalize">{keyword.intent}</span>
                  </div>
                  
                  {/* Priority Badge */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(keyword.priority)}`}>
                    {keyword.priority.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-white/60">
                  {keyword.difficulty && (
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      <span className={getDifficultyColor(keyword.difficulty)}>
                        {keyword.difficulty}
                      </span>
                    </div>
                  )}
                  
                  {keyword.searchVolume && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{keyword.searchVolume.toLocaleString()}/mo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4">
                {keyword.contentCreated ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onCreateContent(keyword)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Content
                  </button>
                )}
              </div>
            </div>

            {keyword.contentCreated && keyword.contentId && (
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-green-300 text-sm">Content created successfully</span>
                  <button className="text-green-400 hover:text-green-300 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredKeywords.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No keywords match your current filters</p>
        </div>
      )}
    </div>
  );
};