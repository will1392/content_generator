import React, { useState } from 'react';
import { Copy, Download, RefreshCw, ArrowRight, ArrowLeft, Loader2, Mic, Clock, List } from 'lucide-react';
import { PodcastContent } from '../../types/project.types';
import { toast } from 'react-toastify';

interface PodcastDisplayProps {
  podcast: PodcastContent | null;
  isLoading: boolean;
  onRegenerate: () => Promise<void>;
  onContinue: () => void;
  onPrevious?: () => void;
}

export const PodcastDisplay: React.FC<PodcastDisplayProps> = ({
  podcast,
  isLoading,
  onRegenerate,
  onContinue,
  onPrevious,
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [showOutline, setShowOutline] = useState(true);

  const handleCopy = async () => {
    if (!podcast) return;
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(podcast.script);
      toast.success('Podcast script copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy script');
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownload = () => {
    if (!podcast) return;

    const content = `${podcast.title}\n\nDuration: ${podcast.duration} minutes\n\nOutline:\n${podcast.outline.join('\n')}\n\nScript:\n${podcast.script}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${podcast.title.replace(/\s+/g, '-').toLowerCase()}-script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Podcast script downloaded successfully!');
  };

  if (isLoading && !podcast) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating podcast script...</p>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No podcast script available</p>
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
          Generate Podcast Script
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Podcast Script</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Mic className="w-4 h-4" />
              Audio Script
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {podcast.duration} min duration
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={isCopying}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            {isCopying ? 'Copying...' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
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
            Continue to Images
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{podcast.title}</h3>
          </div>
          
          {podcast.outline && podcast.outline.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={() => setShowOutline(!showOutline)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
              >
                <List className="w-5 h-5" />
                <span className="font-semibold">Episode Outline</span>
              </button>
              {showOutline && (
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-7">
                  {podcast.outline.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              )}
            </div>
          )}

          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Full Script</h4>
            <div className="prose prose-lg max-w-none">
              {podcast.script.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};