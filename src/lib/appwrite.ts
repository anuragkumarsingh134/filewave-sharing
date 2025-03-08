
import { Client, Storage, Databases, ID, Query, Models } from 'appwrite';

// Appwrite configuration
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint if self-hosted
  .setProject('67cc18e300327dea2755'); // Your project ID

// Initialize Appwrite services
const storage = new Storage(client);
const databases = new Databases(client);

// Database and collection IDs
const DATABASE_ID = 'filewave_db';
const COLLECTION_ID = 'files';

// Initialize Appwrite database and collections (call this on app start)
export const initAppwrite = async () => {
  try {
    // Check if database exists, create if it doesn't
    try {
      await databases.getDatabase(DATABASE_ID);
    } catch (error) {
      await databases.createDatabase(
        DATABASE_ID, 
        'FileWave Database'
      );
    }

    // Check if collection exists, create if it doesn't
    try {
      await databases.listDocuments(
        DATABASE_ID, 
        COLLECTION_ID
      );
    } catch (error) {
      // Create collection
      await databases.createCollection(
        DATABASE_ID, 
        COLLECTION_ID, 
        {
          name: 'Files Collection',
          permissions: []
        }
      );
      
      // Create attributes for our collection
      await databases.createStringAttribute(
        DATABASE_ID, 
        COLLECTION_ID, 
        'name',
        255,
        true
      );
      await databases.createIntegerAttribute(
        DATABASE_ID, 
        COLLECTION_ID, 
        'size',
        true
      );
      await databases.createDatetimeAttribute(
        DATABASE_ID, 
        COLLECTION_ID, 
        'uploadDate',
        true
      );
      await databases.createStringAttribute(
        DATABASE_ID, 
        COLLECTION_ID, 
        'fileId',
        255,
        true
      );
    }
  } catch (error) {
    console.error('Appwrite initialization error:', error);
  }
};

// Upload file to Appwrite storage
export const uploadFile = async (file: File) => {
  try {
    // 1. Upload the file to Appwrite storage
    const storageFile = await storage.createFile(
      'filewave_bucket', // Your bucket ID
      ID.unique(),
      file
    );

    // 2. Create a document in the database with file metadata
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        fileId: storageFile.$id,
      }
    );

    // 3. Return combined information
    return {
      id: document.$id,
      name: file.name,
      size: file.size,
      uploadDate: new Date(document.uploadDate),
      url: getFileViewURL(storageFile.$id),
      fileId: storageFile.$id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Get file preview/download URL
export const getFileViewURL = (fileId: string) => {
  return storage.getFileView('filewave_bucket', fileId).toString();
};

// List all files
export const listFiles = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.orderDesc('uploadDate'),
      ]
    );
    
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      size: doc.size,
      uploadDate: new Date(doc.uploadDate),
      url: getFileViewURL(doc.fileId),
      fileId: doc.fileId,
    }));
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
};

export const deleteFile = async (documentId: string, fileId: string) => {
  try {
    // Delete the file from storage
    await storage.deleteFile('filewave_bucket', fileId);
    
    // Delete the document
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, documentId);
    
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
};
