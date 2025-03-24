import React from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageFile } from '../types/watermark';
import { ImageUp, X, Loader } from 'lucide-react';

interface BatchProcessorProps {
  images: ImageFile[];
  onImagesSelect: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
}

export function BatchProcessor({
  images,
  onImagesSelect,
  onRemoveImage,
  isProcessing,
  processedCount,
  totalCount
}: BatchProcessorProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onImagesSelect,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10485760, // 10MB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <ImageUp className="w-12 h-12 text-gray-400" />
          <p className="text-sm text-gray-600">Drop images here or click to browse</p>
          <p className="text-xs text-gray-500">
            Supports: JPG, PNG, WEBP (max 10MB each)
          </p>
        </div>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-blue-700">
            Processing {processedCount} of {totalCount} images...
          </span>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}