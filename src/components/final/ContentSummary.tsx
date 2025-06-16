import React from 'react';
import { CheckCircle, Download, Home, ExternalLink } from 'lucide-react';
import { Project } from '../../types/project.types';
import { toast } from 'react-toastify';

interface ContentSummaryProps {
  project: Project;
  onNewProject: () => void;
}

interface ContentItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

export const ContentSummary: React.FC<ContentSummaryProps> = ({ project, onNewProject }) => {
  const contentItems: ContentItem[] = [
    {
      title: 'Research',
      description: 'Comprehensive research with definitions, trends, and insights',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      available: true,
    },
    {
      title: 'Blog Post',
      description: 'SEO-optimized blog article ready for publishing',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      available: true,
    },
    {
      title: 'Podcast Script',
      description: 'Engaging podcast script with outline and full content',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      available: true,
    },
    {
      title: 'Audio Content',
      description: 'Professional audio narration of your content',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      available: true,
    },
    {
      title: 'Visual Assets',
      description: 'Thumbnail, featured image, and social media graphics',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      available: true,
    },
    {
      title: 'Social Media',
      description: 'Platform-specific captions with optimized hashtags',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      available: true,
    },
  ];

  const handleExportAll = () => {
    // In a real app, this would compile all content into a downloadable package
    toast.success('Export feature coming soon!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Content Creation Complete!
        </h1>
        <p className="text-lg text-gray-600">
          All content for "{project.keyword}" has been successfully generated
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generated Content Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentItems.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">{item.icon}</div>
              <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExportAll}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Export All Content
            </button>
            <button
              onClick={() => window.open('/projects', '_self')}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View in Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onNewProject}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Start New Project
        </button>
      </div>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Publish your blog post to your website or content platform</li>
          <li>• Upload the podcast audio to your preferred hosting service</li>
          <li>• Schedule social media posts across your platforms</li>
          <li>• Use the images for thumbnails and promotional materials</li>
          <li>• Track engagement and iterate on successful content</li>
        </ul>
      </div>
    </div>
  );
};