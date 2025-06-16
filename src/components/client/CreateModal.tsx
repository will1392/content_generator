import React, { useState } from 'react';
import { X, User, Building2, Mail, FileText, Tag } from 'lucide-react';

interface CreateModalProps {
  type: 'client' | 'project' | 'content';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  type,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<any>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({});
  };

  const getTitle = () => {
    switch (type) {
      case 'client':
        return 'Create New Client';
      case 'project':
        return 'Create New Project';
      case 'content':
        return 'Create New Content';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-black/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {type === 'client' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
            </>
          )}

          {type === 'project' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Project Name *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    required
                    value={formData.project_name || ''}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
                    placeholder="Q1 Content Campaign"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50 resize-none"
                  placeholder="Brief description of the project..."
                />
              </div>
            </>
          )}

          {type === 'content' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Content Name *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    required
                    value={formData.content_name || ''}
                    onChange={(e) => setFormData({ ...formData, content_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
                    placeholder="AI Tools Guide"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Target Keyword *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    required
                    value={formData.keyword || ''}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
                    placeholder="best AI tools 2024"
                  />
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#533de3] hover:bg-[#4531b8] rounded-xl text-white font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};