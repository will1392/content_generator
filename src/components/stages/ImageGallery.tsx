import React from 'react';
import { Download, RefreshCw, ArrowRight, Loader2, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { ImagesContent } from '../../types/project.types';
import { toast } from 'react-toastify';

interface ImageGalleryProps {
  images: ImagesContent | null;
  isLoading: boolean;
  onRegenerate: () => Promise<void>;
  onContinue: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  isLoading,
  onRegenerate,
  onContinue,
}) => {
  const handleDownload = (imageUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`${filename} downloaded successfully!`);
  };

  const handleDownloadAll = () => {
    if (!images) return;

    handleDownload(images.thumbnailUrl, 'thumbnail.jpg');
    handleDownload(images.featuredImageUrl, 'featured-image.jpg');
    images.socialMediaImages.forEach((img, index) => {
      handleDownload(img.imageUrl, `${img.platform}-image-${index + 1}.jpg`);
    });
    toast.success('All images downloaded successfully!');
  };

  if (isLoading && !images) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating images...</p>
        </div>
      </div>
    );
  }

  if (!images) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No images available</p>
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
          Generate Images
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generated Images</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              {2 + images.socialMediaImages.length} images total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAll}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
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
            Continue to Social
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-video relative group">
            <img
              src={images.thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <button
                onClick={() => window.open(images.thumbnailUrl, '_blank')}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-full"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Thumbnail</h3>
            <button
              onClick={() => handleDownload(images.thumbnailUrl, 'thumbnail.jpg')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Download
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-video relative group">
            <img
              src={images.featuredImageUrl}
              alt="Featured"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <button
                onClick={() => window.open(images.featuredImageUrl, '_blank')}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-full"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Featured Image</h3>
            <button
              onClick={() => handleDownload(images.featuredImageUrl, 'featured-image.jpg')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Download
            </button>
          </div>
        </div>

        {images.socialMediaImages.map((img, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video relative group">
              <img
                src={img.imageUrl}
                alt={`${img.platform} image`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => window.open(img.imageUrl, '_blank')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-full"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 capitalize">{img.platform}</h3>
              <p className="text-xs text-gray-600 mb-2">{img.dimensions}</p>
              <button
                onClick={() => handleDownload(img.imageUrl, `${img.platform}-image.jpg`)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};