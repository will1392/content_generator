import React, { useState } from 'react';
import { Copy, RefreshCw, ArrowRight, Loader2, Twitter, Linkedin, Instagram, Hash } from 'lucide-react';
import { SocialContent } from '../../types/project.types';
import { toast } from 'react-toastify';

interface SocialCaptionsProps {
  social: SocialContent | null;
  isLoading: boolean;
  onRegenerate: () => Promise<void>;
  onContinue: () => void;
}

type Platform = 'twitter' | 'linkedin' | 'instagram';

export const SocialCaptions: React.FC<SocialCaptionsProps> = ({
  social,
  isLoading,
  onRegenerate,
  onContinue,
}) => {
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);

  const handleCopy = async (platform: Platform, content: string) => {
    setCopiedPlatform(platform);
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} content copied!`);
    } catch (error) {
      toast.error('Failed to copy content');
    } finally {
      setTimeout(() => setCopiedPlatform(null), 2000);
    }
  };

  const formatTwitterThread = (thread: string[]) => {
    return thread.join('\n\n');
  };

  const formatHashtags = (hashtags: string[]) => {
    return hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
  };

  if (isLoading && !social) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating social media content...</p>
        </div>
      </div>
    );
  }

  if (!social) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No social media content available</p>
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
          Generate Social Content
        </button>
      </div>
    );
  }

  const platforms = [
    {
      id: 'twitter' as Platform,
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-blue-400',
      content: formatTwitterThread(social.twitter.thread),
      hashtags: formatHashtags(social.twitter.hashtags),
    },
    {
      id: 'linkedin' as Platform,
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-blue-600',
      content: social.linkedin.post,
      hashtags: formatHashtags(social.linkedin.hashtags),
    },
    {
      id: 'instagram' as Platform,
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'bg-pink-500',
      content: social.instagram.caption,
      hashtags: formatHashtags(social.instagram.hashtags),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Social Media Content</h2>
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
            Complete Project
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className={`${platform.color} text-white px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {platform.icon}
                <h3 className="text-lg font-semibold">{platform.name}</h3>
              </div>
              <button
                onClick={() => handleCopy(platform.id, `${platform.content}\n\n${platform.hashtags}`)}
                className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copiedPlatform === platform.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-700 whitespace-pre-wrap">{platform.content}</p>
              </div>
              
              {platform.hashtags && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Hashtags</span>
                  </div>
                  <p className="text-blue-600">{platform.hashtags}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};