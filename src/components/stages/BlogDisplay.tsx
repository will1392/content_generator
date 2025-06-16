import React, { useState } from 'react';
import { Copy, Download, RefreshCw, ArrowRight, Loader2, FileText, Clock, Bookmark, Podcast, Tag, Calendar, Award, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BlogContent } from '../../types/project.types';
import { toast } from 'react-toastify';

interface BlogDisplayProps {
  blog: BlogContent | null;
  isLoading: boolean;
  onRegenerate: () => Promise<void>;
  onContinue: () => void;
}

export const BlogDisplay: React.FC<BlogDisplayProps> = ({
  blog,
  isLoading,
  onRegenerate,
  onContinue,
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRawContent, setShowRawContent] = useState(false);

  const handleCopy = async () => {
    if (!blog) return;
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(blog.content);
      toast.success('Blog content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownload = () => {
    if (!blog) return;

    const content = `${blog.title}\n\n${blog.metaDescription}\n\n${blog.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blog.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Blog downloaded successfully!');
  };

  const handleSave = () => {
    setIsSaved(true);
    toast.success('Blog saved to your dashboard!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isLoading && !blog) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-3xl opacity-20"></div>
            <Loader2 className="w-16 h-16 animate-spin text-[#533de3] mx-auto mb-4 relative" />
          </div>
          <p className="text-white/80 text-lg">Crafting your SEO-optimized blog...</p>
          <p className="text-white/60 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
          <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/80 mb-6 text-lg">No blog content available yet</p>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 bg-[#533de3] text-white rounded-2xl hover:bg-[#4531b8] disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 mr-2" />
            )}
            Generate Blog
          </button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Header with Title */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{blog.title}</h1>
        <p className="text-lg text-white/70">Keyword Blog Report for: <span className="text-[#533de3] font-semibold">{blog.targetKeywords?.[0] || 'SEO Content'}</span></p>
      </div>

      {/* Main Content Layout - CSS Grid with proper boundaries */}
      <div className="blog-page-container relative grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 min-h-[calc(100vh-200px)]">
        {/* Blog Content - Left Side (75% on desktop) */}
        <div className="lg:col-span-3 blog-content pb-32 lg:pb-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl h-full">
            {/* Meta Description */}
            <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white/90 italic">{blog.metaDescription}</p>
            </div>

            {/* View Toggle */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowRawContent(!showRawContent)}
                className="inline-flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors"
              >
                {showRawContent ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showRawContent ? 'Show Formatted' : 'Show Raw'}
              </button>
            </div>

            {/* Blog Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              {showRawContent ? (
                <pre className="whitespace-pre-wrap text-white/80 font-mono text-sm bg-black/20 p-6 rounded-2xl overflow-x-auto">
                  {blog.content}
                </pre>
              ) : (
                <div className="text-white/90">
                  <ReactMarkdown
                    components={{
                    h1: ({children}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-2xl font-bold text-white mt-6 mb-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-semibold text-white mt-4 mb-2">{children}</h3>,
                    p: ({children}) => <p className="text-white/85 leading-relaxed mb-4">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside text-white/85 mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside text-white/85 mb-4 space-y-2">{children}</ol>,
                    li: ({children}) => <li className="text-white/85">{children}</li>,
                    strong: ({children}) => <strong className="text-[#533de3] font-semibold">{children}</strong>,
                    em: ({children}) => <em className="text-white/90">{children}</em>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-[#533de3] pl-4 my-4 text-white/80 italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                  >
                    {blog.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Sidebar - Right Side (25% on desktop) */}
        <div className="sidebar space-y-6 h-fit lg:sticky lg:top-24">
          {/* Metadata Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-6">Blog Metadata</h3>
            
            {/* Keywords */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-white/60" />
                <span className="text-white/80 font-medium">Primary Keywords</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(blog.targetKeywords || []).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#533de3]/20 text-[#533de3] rounded-full text-sm font-medium border border-[#533de3]/30"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Read Time */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white/80 font-medium">Estimated Read Time</span>
              </div>
              <p className="text-2xl font-bold text-white">{blog.readingTime || 8} min read</p>
            </div>

            {/* Date Created */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-white/60" />
                <span className="text-white/80 font-medium">Date Created</span>
              </div>
              <p className="text-white/90">{currentDate}</p>
            </div>

            {/* Quality Score */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-white/60" />
                <span className="text-white/80 font-medium">AI Quality Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                  Optimized
                </div>
                <span className="text-white/60 text-sm">{blog.readabilityScore || 'Grade 8'}</span>
              </div>
            </div>

            {/* Word Count */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-white/60" />
                <span className="text-white/80 font-medium">Word Count</span>
              </div>
              <p className="text-xl font-semibold text-white">{(blog.wordCount || 1500).toLocaleString()} words</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 font-medium">Progress</span>
              <span className="text-white/60 text-sm">Step 2 of 6</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-3">
              <div className="bg-[#533de3] h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
            <p className="text-white/60 text-sm">Next: Generate Podcast Script</p>
          </div>
        </div>
      </div>

      {/* Action Bar - Desktop (Non-overlapping) */}
      <div className="hidden lg:block mt-8">
        <div className="bg-black/90 backdrop-blur-xl rounded-3xl px-6 py-4 border border-white/20 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 border border-white/20"
            >
              <Download className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Download</span>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Export as Markdown
              </div>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaved}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 border border-white/20 disabled:bg-green-500/20 disabled:border-green-500/30"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'text-green-400 fill-green-400' : 'text-white'}`} />
              <span className={`font-medium ${isSaved ? 'text-green-400' : 'text-white'}`}>
                {isSaved ? 'Saved!' : 'Save'}
              </span>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Save to Dashboard
              </div>
            </button>

            {/* Generate Podcast Button (Primary CTA) */}
            <button
              onClick={onContinue}
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#533de3] hover:bg-[#4531b8] rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Podcast className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Generate Podcast</span>
              <ArrowRight className="w-4 h-4 text-white" />
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Continue to next step
              </div>
            </button>

            {/* Regenerate Button */}
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 border border-white/20 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-white" />
              )}
              <span className="text-white font-medium">Regenerate</span>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Generate new version
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Action Bar (Fixed at bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/20 p-4 z-50 cta-footer-mobile">
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
          <button
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#533de3] hover:bg-[#4531b8] rounded-xl text-white font-medium transition-colors"
          >
            <Podcast className="w-5 h-5" />
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};