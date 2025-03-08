
import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList, type FileInfo } from '@/components/FileList';
import { toast } from 'sonner';
import { initAppwrite, listFiles, uploadFile } from '@/lib/appwrite';

const Index = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Appwrite and load files
    const setup = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Appwrite
        await initAppwrite();
        
        // Try to load files
        try {
          const filesList = await listFiles();
          setFiles(filesList);
        } catch (fileError) {
          console.error('Failed to load files:', fileError);
          toast.error('Unable to load files. Please ensure your Appwrite bucket is set up.');
        }
      } catch (error) {
        console.error('Setup error:', error);
        toast.error('Failed to connect to the storage service');
      } finally {
        setIsLoading(false);
      }
    };

    setup();
  }, []);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;
    
    const newFiles: FileInfo[] = [];
    setIsLoading(true);
    
    for (const file of uploadedFiles) {
      try {
        const fileInfo = await uploadFile(file);
        newFiles.push(fileInfo);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload: ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...newFiles, ...prev]);
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl py-12 mx-auto">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-900">File Wave</h1>
            <p className="mt-2 text-gray-600">
              Simple and secure file sharing with Appwrite
            </p>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <FileUpload onUpload={handleFileUpload} />
          </div>

          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mint-500"></div>
            </div>
          )}

          {!isLoading && files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">Uploaded Files</h2>
              <FileList files={files} />
            </div>
          )}
          
          {!isLoading && files.length === 0 && (
            <div className="text-center p-8 bg-white/80 rounded-xl">
              <p className="text-gray-500">No files uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
