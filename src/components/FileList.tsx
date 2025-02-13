
import React from 'react';
import { Download, Copy, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export interface FileInfo {
  name: string;
  size: number;
  uploadDate: Date;
  url: string;
}

interface FileListProps {
  files: FileInfo[];
}

export const FileList = ({ files }: FileListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = async (url: string) => {
    try {
      // Create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      
      // Select the text
      tempInput.select();
      tempInput.setSelectionRange(0, 99999); // For mobile devices
      
      // Copy the text
      document.execCommand('copy');
      
      // Remove the temporary element
      document.body.removeChild(tempInput);
      
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="p-4 transition-all duration-300 bg-white rounded-lg shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-mint-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-mint-600"
                onClick={() => copyToClipboard(file.url)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-mint-600"
                onClick={() => window.open(file.url, '_blank')}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
