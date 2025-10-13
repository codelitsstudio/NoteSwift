// Cloudinary Service using direct API (consistent with admin panel)

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

      // Extract base64 data (remove data:image/... prefix)
      const base64Data = base64Image.split(',')[1];

      // Upload using direct API (same as admin panel)
      const formData = new FormData();
      formData.append('file', `data:image/jpeg;base64,${base64Data}`);
      formData.append('upload_preset', 'ml_default'); // Use existing preset
      formData.append('folder', 'noteswift/profile-images');
      formData.append('public_id', `user_${userId}_${Date.now()}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary API error:', errorData);
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
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
    } catch (error: any) {
      console.error('❌ Cloudinary upload failed:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        http_code: error?.http_code,
        error: error?.error
      });
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

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY!,
            api_secret: process.env.CLOUDINARY_API_SECRET!,
            timestamp: Math.floor(Date.now() / 1000).toString(),
          }),
        }
      );

      if (!response.ok) {
        console.error('Cloudinary delete API error:', await response.text());
      } else {
        const result = await response.json();
        if (result.result === 'ok') {
          console.log('✅ Profile image deleted successfully');
        } else {
          console.log('⚠️ Image deletion result:', result.result);
        }
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
    // Return Cloudinary URL with transformations
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,g_face,w_${width},h_${height},q_auto,f_auto/${publicId}`;
  }
}

export default CloudinaryService;