import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageUp as ImageUpload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  accept: string;
  label: string;
}

export function ImageUploader({ onImageSelect, accept, label }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <ImageUpload className="w-12 h-12 text-gray-400" />
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xs text-gray-500">
          Drop your {label.toLowerCase()} here or click to browse
        </p>
      </div>
    </div>
  );
}