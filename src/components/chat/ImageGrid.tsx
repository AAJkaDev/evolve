import React, { useState } from 'react';
import Image from 'next/image';
import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';
import { ImageResult } from '@/features/mediaSearch';

interface ImageGridProps {
  images: ImageResult[];
  query?: string;
}

interface PreviewDrawerProps {
  image: ImageResult;
  isOpen: boolean;
  onClose: () => void;
  query?: string;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, query = '' }) => {
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  const handleImageClick = (image: ImageResult) => {
    setSelectedImage(image);
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No images found for &ldquo;{query}&rdquo;
      </div>
    );
  }

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg bg-gray-100 hover:shadow-lg transition-all duration-200 motion-reduce:transition-none"
            onClick={() => handleImageClick(image)}
          >
            <Image
              src={image.thumb}
              alt={image.alt || `Photo by ${image.photographer} about ${query}` || `Educational image from Pexels`}
              width={400}
              height={300}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100"
              loading={index < 6 ? 'eager' : 'lazy'} // Load first 6 images eagerly
              unoptimized={false} // Use Next.js optimization
            />
            
            {/* Photographer credit - always visible */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="text-xs text-white">
                Photo by {image.photographer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Drawer */}
      {selectedImage && (
        <PreviewDrawer
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={handleClosePreview}
          query={query}
        />
      )}
    </>
  );
};

const PreviewDrawer: React.FC<PreviewDrawerProps> = ({ image, isOpen, onClose, query }) => {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const downloadButtonRef = React.useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts and focus management
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Tab navigation within modal
      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
      
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(image.full);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pexels-${image.id}-${image.photographer.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(image.full, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="image-preview-title">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Centered Modal */}
      <div ref={drawerRef} className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex-1 min-w-0">
            <h3 id="image-preview-title" className="text-xl font-semibold text-[var(--evolve-charcoal)] truncate">
              {query ? `"${query}"` : 'Image Preview'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Photo by {image.photographer}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title="Close (Esc)"
            aria-label="Close image preview"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-hidden bg-[var(--evolve-paper)] flex items-center justify-center p-6">
          <div className="max-w-full max-h-full flex items-center justify-center">
            <Image
              src={image.full}
              alt={`Image about ${query}` || `Photo by ${image.photographer}`}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              unoptimized={false}
              priority
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-6 bg-white border-t border-gray-200 rounded-b-lg">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                ref={downloadButtonRef}
                onClick={handleDownload}
                className="flex items-center space-x-2 px-6 py-3 bg-[var(--evolve-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                title="Download image"
              >
                <FiDownload size={18} />
                <span>Download</span>
              </button>
              
              <a
                href={image.pexelsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-sm"
                title="View on Pexels"
              >
                <FiExternalLink size={18} />
                <span>View on Pexels</span>
              </a>
            </div>
            
            {/* Credit Line */}
            <div className="text-sm text-gray-600">
              Photo by{' '}
              <a
                href={image.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--evolve-primary)] hover:text-[var(--evolve-secondary)] font-medium transition-colors"
              >
                {image.photographer}
              </a>
              {' '}on{' '}
              <a
                href={image.pexelsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--evolve-primary)] hover:text-[var(--evolve-secondary)] font-medium transition-colors"
              >
                Pexels
              </a>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            This image is used for educational purposes. Please respect the original creator and licensing terms.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGrid;
