import { createClient } from '@/utils/supabase/client';

// Types for storage operations
export interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: any;
}

export interface StorageFolder {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: any;
}

export interface ImageWithUrl extends StorageFile {
  url: string;
  publicUrl: string;
}

// Utility class for Supabase Storage operations
export class SupabaseStorageManager {
  private supabase = createClient();
  private bucketName = 'Bikeralliance';
  private imagePath = 'Image';

  /**
   * List all folders in the Image directory
   */
  async listImageFolders(): Promise<{ folders: StorageFolder[], error?: string }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(this.imagePath, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error listing folders:', error);
        return { folders: [], error: error.message };
      }

      // Filter only folders (directories)
      const folders = (data || []).filter(item => !item.name.includes('.')) as StorageFolder[];
      
      return { folders };
    } catch (error) {
      console.error('Exception in listImageFolders:', error);
      return { folders: [], error: 'Failed to list folders' };
    }
  }

  /**
   * List all files in a specific folder
   */
  async listFolderFiles(folderName: string): Promise<{ files: StorageFile[], error?: string }> {
    try {
      const folderPath = `${this.imagePath}/${folderName}`;
      
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(folderPath, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`Error listing files in folder ${folderName}:`, error);
        return { files: [], error: error.message };
      }

      // Filter only files (not folders)
      const files = (data || []).filter(item => 
        item.name.includes('.') && 
        /\.(jpg|jpeg|png|avif|webp|gif|svg)$/i.test(item.name)
      ) as StorageFile[];
      
      return { files };
    } catch (error) {
      console.error(`Exception in listFolderFiles for ${folderName}:`, error);
      return { files: [], error: 'Failed to list files' };
    }
  }

  /**
   * Get files with their public URLs
   */
  async getFilesWithUrls(folderName: string): Promise<{ images: ImageWithUrl[], error?: string }> {
    const { files, error } = await this.listFolderFiles(folderName);
    
    if (error) {
      return { images: [], error };
    }

    const images: ImageWithUrl[] = files.map(file => {
      const filePath = `${this.imagePath}/${folderName}/${file.name}`;
      const { data } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        ...file,
        url: data.publicUrl,
        publicUrl: data.publicUrl
      };
    });

    return { images };
  }

  /**
   * Upload a file to a specific folder
   */
  async uploadFile(
    folderName: string, 
    fileName: string, 
    file: File
  ): Promise<{ success: boolean, url?: string, error?: string }> {
    try {
      const filePath = `${this.imagePath}/${folderName}/${fileName}`;
      
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing files
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return { 
        success: true, 
        url: urlData.publicUrl 
      };
    } catch (error) {
      console.error('Exception in uploadFile:', error);
      return { success: false, error: 'Failed to upload file' };
    }
  }

  /**
   * Delete a file from a folder
   */
  async deleteFile(
    folderName: string, 
    fileName: string
  ): Promise<{ success: boolean, error?: string }> {
    try {
      const filePath = `${this.imagePath}/${folderName}/${fileName}`;
      
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in deleteFile:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(folderName: string): Promise<{ success: boolean, error?: string }> {
    try {
      // Supabase doesn't create empty folders, so we create a placeholder file
      const placeholderPath = `${this.imagePath}/${folderName}/.placeholder`;
      
      const placeholder = new Blob([''], { type: 'text/plain' });
      
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(placeholderPath, placeholder);

      if (error) {
        console.error('Create folder error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in createFolder:', error);
      return { success: false, error: 'Failed to create folder' };
    }
  }

  /**
   * Get a public URL for a specific file
   */
  getPublicUrl(folderName: string, fileName: string): string {
    const filePath = `${this.imagePath}/${folderName}/${fileName}`;
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Get hero section images specifically
   */
  async getHeroImages(): Promise<{ images: string[], error?: string }> {
    const { images, error } = await this.getFilesWithUrls('hero_section');
    
    if (error) {
      return { images: [], error };
    }

    return { 
      images: images.map(img => img.url)
    };
  }

  /**
   * Upload multiple files to a folder
   */
  async uploadMultipleFiles(
    folderName: string,
    files: File[]
  ): Promise<{ results: Array<{ fileName: string, success: boolean, url?: string, error?: string }> }> {
    const results = [];
    
    for (const file of files) {
      const result = await this.uploadFile(folderName, file.name, file);
      results.push({
        fileName: file.name,
        ...result
      });
    }
    
    return { results };
  }
}

// Export a singleton instance
export const storageManager = new SupabaseStorageManager();