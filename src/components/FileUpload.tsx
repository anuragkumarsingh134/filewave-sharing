
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
}

export const FileUpload = ({ onUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative w-full p-8 transition-all duration-300 ease-in-out
        border-2 border-dashed rounded-lg
        ${isDragActive ? 'border-mint-400 bg-mint-50/50' : 'border-gray-300 hover:border-mint-300'}
        animate-fade-in
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className={`w-12 h-12 ${isDragActive ? 'text-mint-500' : 'text-gray-400'}`} />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">
            Drag & drop files here
          </p>
          <p className="mt-1 text-sm text-gray-500">
            or click to select files
          </p>
        </div>
        <Button
          variant="outline"
          className="mt-4 bg-white hover:bg-mint-50"
        >
          Select Files
        </Button>
      </div>
    </div>
  );
};
