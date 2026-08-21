import React, { useState, useRef } from 'react';
import { Upload, X, Star, Loader2, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ImageUploaderProps {
  thumbnail: string;
  setThumbnail: (url: string) => void;
  images: string[];
  setImages: (urls: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  thumbnail,
  setThumbnail,
  images,
  setImages,
}) => {
  const { error, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ozeuuvgz';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'velora_store';

  // Upload single file to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error(`Unsupported format (${file.name}). Please use PNG, JPG, or WebP.`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Cloudinary upload failed for ${file.name}`);
    }

    const data = await res.json();
    return data.secure_url;
  };

  // Handle file selection or drop
  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploadingCount(prev => prev + fileList.length);

    const newUploadedUrls: string[] = [];

    for (const file of fileList) {
      try {
        const url = await uploadToCloudinary(file);
        newUploadedUrls.push(url);
      } catch (err: any) {
        error('Upload Error', err.message || 'Failed to upload image');
      } finally {
        setUploadingCount(prev => Math.max(0, prev - 1));
      }
    }

    if (newUploadedUrls.length > 0) {
      const updatedImages = [...images, ...newUploadedUrls];
      setImages(updatedImages);

      // If no thumbnail set yet, use the first uploaded image as primary thumbnail
      if (!thumbnail && updatedImages.length > 0) {
        setThumbnail(updatedImages[0]);
      }
      success('Image Uploaded', `Successfully uploaded ${newUploadedUrls.length} image(s) to Cloudinary.`);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove an image from gallery
  const handleRemoveImage = (urlToRemove: string) => {
    const updated = images.filter(url => url !== urlToRemove);
    setImages(updated);
    if (thumbnail === urlToRemove) {
      setThumbnail(updated[0] || '');
    }
  };

  // Add manual URL
  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    const url = manualUrlInput.trim();
    const updated = [...images, url];
    setImages(updated);
    if (!thumbnail) {
      setThumbnail(url);
    }
    setManualUrlInput('');
    success('Image Added', 'URL added to product gallery.');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Product Images ({images.length})
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          {showManualUrl ? 'Use Drag & Drop Uploader' : 'Paste Direct Image URL'}
        </button>
      </div>

      {showManualUrl ? (
        /* Manual URL Paste Mode */
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={manualUrlInput}
              onChange={e => setManualUrlInput(e.target.value)}
              className="flex-1 p-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="px-3 py-1.5 bg-orange-600 text-white font-bold text-xs rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add URL
            </button>
          </div>
        </div>
      ) : (
        /* Cloudinary Drag & Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 scale-[1.01]'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-500 bg-zinc-50/50 dark:bg-zinc-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs">
              {uploadingCount > 0 ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {uploadingCount > 0
                  ? `Uploading ${uploadingCount} image(s) to Cloudinary...`
                  : 'Click or drag & drop product images'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                PNG, JPG, or WebP up to 10MB • Auto-optimized via Cloudinary CDN
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Images Thumbnails Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] text-zinc-400 font-medium block">
            Click thumbnail star <Star className="w-3 h-3 inline text-amber-500 fill-amber-500" /> to set primary thumbnail image:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((url, idx) => {
              const isPrimary = thumbnail === url;
              return (
                <div
                  key={`${url}-${idx}`}
                  className={`relative group rounded-xl overflow-hidden border-2 aspect-square bg-zinc-100 dark:bg-zinc-800 ${
                    isPrimary
                      ? 'border-orange-500 ring-2 ring-orange-500/30'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product gallery image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Badges */}
                  {isPrimary && (
                    <span className="absolute top-1 left-1 bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                      PRIMARY
                    </span>
                  )}

                  {/* Action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                    <button
                      type="button"
                      title="Set as primary thumbnail"
                      onClick={() => setThumbnail(url)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isPrimary
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/80 hover:bg-white text-zinc-700'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isPrimary ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      type="button"
                      title="Remove image"
                      onClick={() => handleRemoveImage(url)}
                      className="p-1.5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
