
import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList, type FileInfo } from '@/components/FileList';

const STORAGE_KEY = 'filewave_files';

const Index = () => {
  const [files, setFiles] = useState<FileInfo[]>(() => {
    // Initialize files from localStorage on component mount
    const savedFiles = localStorage.getItem(STORAGE_KEY);
    if (savedFiles) {
      try {
        return JSON.parse(savedFiles).map((file: FileInfo & { data: string }) => ({
          ...file,
          uploadDate: new Date(file.uploadDate),
          url: file.data // Restore the data URL
        }));
      } catch (error) {
        console.error('Error parsing saved files:', error);
        return [];
      }
    }
    return [];
  });

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files.map(file => ({
      ...file,
      data: file.url // Store the data URL
    }))));
  }, [files]);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    const newFiles: FileInfo[] = [];

    for (const file of uploadedFiles) {
      // Convert file to base64 data URL
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      newFiles.push({
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
        url: dataUrl,
      });
    }

    setFiles(prev => [...newFiles, ...prev]);
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
