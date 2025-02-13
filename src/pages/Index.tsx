
import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList, type FileInfo } from '@/components/FileList';
import { toast } from 'sonner';

const DB_NAME = 'filewave_db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

const Index = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    // Initialize IndexedDB and load files
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      toast.error('Failed to open database');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const savedFiles = getAllRequest.result;
        setFiles(savedFiles.map(file => ({
          ...file,
          uploadDate: new Date(file.uploadDate)
        })));
      };
    };
  }, []);

  const saveToIndexedDB = async (newFiles: FileInfo[]) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      newFiles.forEach(file => {
        store.put(file);
      });

      transaction.oncomplete = () => {
        setFiles(prev => [...newFiles, ...prev]);
        toast.success(`${newFiles.length} file(s) uploaded successfully`);
      };

      transaction.onerror = () => {
        toast.error('Failed to save files');
      };
    };
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    const newFiles: FileInfo[] = [];

    for (const file of uploadedFiles) {
      try {
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
      } catch (error) {
        toast.error(`Failed to process file: ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      await saveToIndexedDB(newFiles);
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
