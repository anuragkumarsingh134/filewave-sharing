
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList, type FileInfo } from '@/components/FileList';

const Index = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // In a real implementation, you would upload to your server here
      // For now, we'll simulate the upload
      const newFiles: FileInfo[] = uploadedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
        url: URL.createObjectURL(file), // In production, this would be the server URL
      }));

      setFiles((prev) => [...newFiles, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl py-12 mx-auto">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-900">File Wave</h1>
            <p className="mt-2 text-gray-600">
              Simple and secure file sharing
            </p>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <FileUpload onUpload={handleFileUpload} />
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">Uploaded Files</h2>
              <FileList files={files} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
