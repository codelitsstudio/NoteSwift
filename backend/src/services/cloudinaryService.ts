import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Upload profile image to Cloudinary
   * @param base64Image - Base64 encoded image string
   * @param userId - User ID for unique naming
   * @returns Promise with upload result
   */
  static async uploadProfileImage(base64Image: string, userId: string): Promise<CloudinaryUploadResult> {
    try {
      console.log('📤 Uploading profile image to Cloudinary for user:', userId);
      
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'noteswift/profile-images',
        public_id: `user_${userId}_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        overwrite: true,
      });

      console.log('✅ Profile image uploaded successfully:', result.secure_url);
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Delete profile image from Cloudinary
   * @param publicId - Cloudinary public ID
   * @returns Promise with deletion result
   */
  static async deleteProfileImage(publicId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting profile image from Cloudinary:', publicId);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log('✅ Profile image deleted successfully');
      } else {
        console.log('⚠️ Image deletion result:', result.result);
      }
    } catch (error) {
      console.error('❌ Cloudinary deletion failed:', error);
      // Don't throw error for deletion failures - log and continue
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param publicId - Cloudinary public ID
   * @param width - Desired width
   * @param height - Desired height
   * @returns Optimized image URL
   */
  static getOptimizedImageUrl(publicId: string, width: number = 400, height: number = 400): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:good',
      fetch_format: 'auto',
    });
  }
}

export default CloudinaryService;