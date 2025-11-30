// File Upload utility for Supabase Storage
import { createClient } from '@/lib/supabase-client';

export class FileUploadService {
  private supabase = createClient();
  private bucketName = 'bikeralliance';

  /**
   * Upload a single file to Supabase Storage
   */
  async uploadFile(
    folder: string, 
    file: File, 
    fileName?: string
  ): Promise<{ url: string; path: string }> {
    try {
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFileName}`;

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload multiple files for a variant
   */
  async uploadVariantImages(
    variantId: string, 
    files: File[]
  ): Promise<Array<{ url: string; path: string }>> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${variantId}-${index}-${Date.now()}.${file.name.split('.').pop()}`;
      return this.uploadFile(`variant_image/${variantId}`, file, fileName);
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Upload brand logo
   */
  async uploadBrandLogo(brandId: string, file: File): Promise<{ url: string; path: string }> {
    const fileName = `${brandId}-logo.${file.name.split('.').pop()}`;
    return this.uploadFile('Brand_image', file, fileName);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string): string {
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  }
}

// React Hook for file upload
import { useState } from 'react';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileService = new FileUploadService();

  const uploadFile = async (folder: string, file: File, fileName?: string) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await fileService.uploadFile(folder, file, fileName);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const uploadMultipleFiles = async (folder: string, files: File[]) => {
    setUploading(true);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress((i / files.length) * 100);
      const result = await fileService.uploadFile(folder, files[i]);
      results.push(result);
    }

    setUploadProgress(100);
    setUploading(false);
    setTimeout(() => setUploadProgress(0), 1000);

    return results;
  };

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    deleteFile: fileService.deleteFile.bind(fileService),
    getPublicUrl: fileService.getPublicUrl.bind(fileService)
  };
}

// Example usage in a React component:
/*
import { useFileUpload } from '@/utils/file-upload';

export function BrandForm() {
  const { uploading, uploadProgress, uploadFile } = useFileUpload();
  const [logoUrl, setLogoUrl] = useState('');

  const handleLogoUpload = async (file: File) => {
    try {
      const result = await uploadFile('Brand_image', file);
      setLogoUrl(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload(file);
        }}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <div>Uploading... {uploadProgress}%</div>
          <div className="w-full bg-gray-200 rounded">
            <div 
              className="bg-blue-600 h-2 rounded" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      {logoUrl && <img src={logoUrl} alt="Brand Logo" />}
    </div>
  );
}
*/