import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageFile } from '../types/watermark';
import { ImageUp, X } from 'lucide-react';

interface BatchUploaderProps {
  onImagesSelect: (files: ImageFile[]) => void;
  selectedImages: ImageFile[];
  onRemoveImage: (index: number) => void;
}

export function BatchUploader({
  onImagesSelect,
  selectedImages,
  onRemoveImage
}: BatchUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const imageFiles: ImageFile[] = await Promise.all(
      acceptedFiles.map(async (file) => {
        return new Promise<ImageFile>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
              resolve({
                file,
                preview: reader.result as string,
                width: img.width,
                height: img.height
              });
            };
            img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
        });
      })
    );
    onImagesSelect(imageFiles);
  }, [onImagesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
          <p className="text-sm text-gray-600">Drop multiple images here or click to browse</p>
          <p className="text-xs text-gray-500">
            Supports: JPG, PNG, WEBP (max 10MB each)
          </p>
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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