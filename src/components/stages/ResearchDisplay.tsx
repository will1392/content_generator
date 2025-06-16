import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  Loader2,
  BookOpen,
  TrendingUp,
  BarChart3,
  Users,
  MessageCircle,
  Lightbulb,
  AlertCircle,
  Target,
  FileText,
  Shield,
  CheckCircle
} from 'lucide-react';
import { ResearchContent } from '../../types/project.types';

interface ResearchDisplayProps {
  research: ResearchContent | null;
  isLoading: boolean;
  onRegenerate: () => Promise<void>;
  onContinue: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, id, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-600">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-4">
          <div className="pt-2">{children}</div>
        </div>
      )}
    </div>
  );
};

export const ResearchDisplay: React.FC<ResearchDisplayProps> = ({
  research,
  isLoading,
  onRegenerate,
  onContinue,
}) => {
  // Debug logging to see research structure
  console.log('Research structure:', research);
  console.log('Keys in research:', research ? Object.keys(research) : 'No research');
  if (isLoading && !research) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating research content...</p>
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No research content available</p>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Generate Research
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Research Results</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Regenerate
          </button>
          <button
            onClick={onContinue}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue to Blog
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Definition */}
        {research.definition && (
          <Section title="Definition" icon={BookOpen} id="definition">
            <p className="text-gray-700">{research.definition}</p>
          </Section>
        )}

        {/* Overview */}
        {research.overview && (
          <Section title="Overview" icon={FileText} id="overview">
            <p className="text-gray-700">{research.overview}</p>
          </Section>
        )}

        {/* Search Intent Analysis */}
        {research.searchIntent && (
          <Section title="Search Intent & User Goals" icon={Target} id="searchIntent">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Primary Intent</h4>
                <p className="text-lg font-semibold text-blue-700">
                  {research.searchIntent?.primary || 'Not analyzed'}
                </p>
              </div>
              
              {research.searchIntent?.userGoals && research.searchIntent.userGoals.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What Users Want</h4>
                  <ul className="space-y-1">
                    {research.searchIntent.userGoals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {research.searchIntent?.relatedQueries && research.searchIntent.relatedQueries.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Related Searches</h4>
                  <div className="flex flex-wrap gap-2">
                    {research.searchIntent.relatedQueries.map((query, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {query}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* E-E-A-T Indicators */}
        {(research.expertiseIndicators || research.trustSignals) && (
          <Section title="E-E-A-T Signals" icon={Shield} id="eeat">
            <div className="grid md:grid-cols-2 gap-6">
              {research.expertiseIndicators?.industryStandards && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Expertise Indicators</h4>
                  <div className="space-y-2">
                    {research.expertiseIndicators.industryStandards.map((standard, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{standard}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {research.trustSignals?.bestPractices && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Trust Signals</h4>
                  <div className="space-y-2">
                    {research.trustSignals.bestPractices.map((practice, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* SEO Opportunities */}
        {(research.competitiveLandscape || research.featuredSnippetOpps || research.semanticSEO) && (
          <Section title="SEO Opportunities" icon={TrendingUp} id="seo">
            <div className="space-y-4">
              {research.competitiveLandscape?.contentGaps && research.competitiveLandscape.contentGaps.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Content Gaps to Fill</h4>
                  <ul className="space-y-1">
                    {research.competitiveLandscape.contentGaps.map((gap, i) => (
                      <li key={i} className="text-gray-700">• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {research.featuredSnippetOpps && research.featuredSnippetOpps.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Featured Snippet Opportunities</h4>
                  <div className="space-y-3">
                    {research.featuredSnippetOpps.slice(0, 3).map((opp, i) => (
                      <div key={i}>
                        <p className="font-medium text-gray-800">Q: {opp.question}</p>
                        <p className="text-sm text-gray-600 mt-1">A: {opp.optimalAnswer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {research.semanticSEO?.lsiKeywords && research.semanticSEO.lsiKeywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">LSI Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {research.semanticSEO.lsiKeywords.map((keyword, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Current Trends */}
        {research.currentTrends && research.currentTrends.length > 0 && (
          <Section title="Current Trends" icon={TrendingUp} id="trends">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {research.currentTrends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Statistics */}
        {research.statistics && research.statistics.length > 0 && (
          <Section title="Statistics" icon={BarChart3} id="statistics">
            <div className="space-y-3">
              {research.statistics.map((stat, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  {typeof stat === 'string' ? (
                    <p className="text-gray-700">{stat}</p>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">{stat.metric}: {stat.value}</p>
                      <p className="text-sm text-gray-600">Source: {stat.source}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Common Questions */}
        {research.commonQuestions && research.commonQuestions.length > 0 && (
          <Section title="Common Questions" icon={MessageCircle} id="questions">
            <div className="space-y-4">
              {research.commonQuestions.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  {typeof item === 'string' ? (
                    <p className="text-gray-700">{item}</p>
                  ) : (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Q: {item.question}</h4>
                      <p className="text-gray-700">A: {item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Applications */}
        {research.applications && research.applications.length > 0 && (
          <Section title="Applications" icon={Lightbulb} id="applications">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {research.applications.map((app, index) => (
                <li key={index}>{app}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Challenges */}
        {research.challenges && research.challenges.length > 0 && (
          <Section title="Challenges" icon={AlertCircle} id="challenges">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {research.challenges.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Opportunities */}
        {research.opportunities && research.opportunities.length > 0 && (
          <Section title="Opportunities" icon={Target} id="opportunities">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {research.opportunities.map((opportunity, index) => (
                <li key={index}>{opportunity}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
};