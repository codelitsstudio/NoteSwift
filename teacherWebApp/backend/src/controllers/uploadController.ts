import { Request, Response } from 'express';
import crypto from 'crypto';

/**
 * Generate Cloudinary signature for secure uploads
 * POST /api/teacher/upload/sign
 */
export const generateSignature = async (req: Request, res: Response) => {
  try {
    console.log('🔐 Generating Cloudinary signature...');
    const { folder } = req.body;

    // Read env variables at runtime
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';

    if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
      console.error('❌ Cloudinary configuration missing!');
      console.error('Debug env:', {
        hasSecret: !!process.env.CLOUDINARY_API_SECRET,
        hasKey: !!process.env.CLOUDINARY_API_KEY,
        hasCloud: !!process.env.CLOUDINARY_CLOUD_NAME,
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudinary configuration missing' 
      });
    }
    
    console.log('✅ Cloudinary config found:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!CLOUDINARY_API_KEY,
      hasApiSecret: !!CLOUDINARY_API_SECRET,
      folder
    });

    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      folder: folder || 'teacher_uploads',
    };

    // Generate signature
    const paramsToSign = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest('hex');

    console.log('✅ Signature generated successfully');
    console.log('📤 Returning data:', {
      signature: signature.substring(0, 10) + '...',
      timestamp,
      cloudName: CLOUDINARY_CLOUD_NAME,
      folder: params.folder
    });

    return res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
        folder: params.folder,
      },
    });
  } catch (error: any) {
    console.error('Generate signature error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
