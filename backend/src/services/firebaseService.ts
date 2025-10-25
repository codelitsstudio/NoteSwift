import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration mapping for different subjects
interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
  storageBucket: string;
}

// Subject to Firebase config mapping
const SUBJECT_FIREBASE_CONFIGS: Record<string, FirebaseConfig> = {
  // Default config for all subjects (single Firebase project as requested)
  default: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  },
  // Add subject-specific configs here if needed in the future
  // 'Mathematics': { ... },
  // 'Physics': { ... },
};

class FirebaseService {
  private static apps: Map<string, admin.app.App> = new Map();
  private static buckets: Map<string, Bucket> = new Map();
  private static firebaseAvailable: boolean = true;

  /**
   * Check if Firebase is available and working
   */
  private static async checkFirebaseAvailability(): Promise<boolean> {
    if (!this.firebaseAvailable) return false;

    try {
      const config = SUBJECT_FIREBASE_CONFIGS.default;
      if (!config.projectId || !config.privateKey || !config.clientEmail || !config.storageBucket) {
        console.log('⚠️ Firebase configuration incomplete, falling back to local storage');
        this.firebaseAvailable = false;
        return false;
      }

      // Try to get a bucket to test Firebase availability
      const bucket = this.getBucket('default');
      await bucket.exists();
      return true;
    } catch (error: any) {
      console.log('⚠️ Firebase not available, falling back to local storage:', error.message);
      this.firebaseAvailable = false;
      return false;
    }
  }

  /**
   * Get local storage directory
   */
  private static getLocalStorageDir(): string {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  /**
   * Upload file to local storage (fallback when Firebase is not available)
   */
  private static async uploadToLocalStorage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subjectName: string,
    type: 'video' | 'notes',
    metadata?: any
  ): Promise<{
    fileName: string;
    downloadUrl: string;
    storagePath: string;
    size: number;
    uploadedAt: Date;
  }> {
    const uploadDir = this.getLocalStorageDir();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${type}s/Subjects/${timestamp}_${sanitizedFileName}`;
    const fullPath = path.join(uploadDir, storagePath);

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(fullPath, fileBuffer);

    // Create local download URL
    const downloadUrl = `${process.env.API_URL || 'http://172.20.10.4:5000'}/uploads/${storagePath}`;

    console.log(`✅ File uploaded to local storage: ${downloadUrl}`);

    return {
      fileName: sanitizedFileName,
      downloadUrl,
      storagePath,
      size: fileBuffer.length,
      uploadedAt: new Date(),
    };
  }

  /**
   * Get or initialize Firebase app for a subject
   */
  private static getFirebaseApp(subjectName: string = 'default'): admin.app.App {
    if (this.apps.has(subjectName)) {
      return this.apps.get(subjectName)!;
    }

    const config = SUBJECT_FIREBASE_CONFIGS[subjectName] || SUBJECT_FIREBASE_CONFIGS.default;

    if (!config.projectId || !config.privateKey || !config.clientEmail) {
      throw new Error(`Firebase configuration not found for subject: ${subjectName}`);
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        privateKey: config.privateKey,
        clientEmail: config.clientEmail,
      }),
      storageBucket: config.storageBucket,
    }, `noteswift-${subjectName}`);

    this.apps.set(subjectName, app);
    return app;
  }

  /**
   * Get Firebase Storage bucket for a subject
   */
  private static getBucket(subjectName: string = 'default'): Bucket {
    if (this.buckets.has(subjectName)) {
      return this.buckets.get(subjectName)!;
    }

    const app = this.getFirebaseApp(subjectName);
    const config = SUBJECT_FIREBASE_CONFIGS[subjectName] || SUBJECT_FIREBASE_CONFIGS.default;
    const bucket = admin.storage(app).bucket(config.storageBucket);
    this.buckets.set(subjectName, bucket);
    return bucket;
  }

  /**
   * Upload video file to Firebase Storage
   */
  static async uploadVideo(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subjectName: string = 'default',
    metadata?: { title?: string; duration?: string; teacherId?: string; courseId?: string }
  ): Promise<{
    fileName: string;
    downloadUrl: string;
    storagePath: string;
    size: number;
    uploadedAt: Date;
  }> {
    // Check if Firebase is available
    const firebaseAvailable = await this.checkFirebaseAvailability();

    if (!firebaseAvailable) {
      console.log('📤 Using local storage fallback for video upload');
      return this.uploadToLocalStorage(fileBuffer, fileName, mimeType, subjectName, 'video', metadata);
    }

    try {
      console.log(`📤 Uploading video to Firebase Storage for subject: ${subjectName}`);
      console.log(`📤 File: ${fileName}, Size: ${fileBuffer.length} bytes, Type: ${mimeType}`);

      const bucket = this.getBucket(subjectName);
      console.log(`📤 Using bucket: ${bucket.name}`);

      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `videos/Subjects/${timestamp}_${sanitizedFileName}`;

      const file = bucket.file(storagePath);

      // Set metadata
      const fileMetadata = {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: fileName,
            uploadedAt: new Date().toISOString(),
            subject: subjectName,
            ...metadata,
          },
        },
      };

      // Upload file
      await file.save(fileBuffer, fileMetadata);

      // Make file publicly readable (for signed URLs)
      await file.makePublic();

      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      console.log(`✅ Video uploaded successfully: ${downloadUrl}`);

      return {
        fileName: sanitizedFileName,
        downloadUrl,
        storagePath,
        size: fileBuffer.length,
        uploadedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Firebase video upload failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));

      // Provide more specific error messages
      if (error.code === 404 && error.message.includes('bucket')) {
        throw new Error(`Firebase Storage bucket does not exist. Please ensure the Firebase project '${SUBJECT_FIREBASE_CONFIGS.default.projectId}' exists and Cloud Storage is enabled.`);
      }

      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Upload notes file to Firebase Storage
   */
  static async uploadNotes(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subjectName: string = 'default',
    metadata?: { title?: string; teacherId?: string; courseId?: string }
  ): Promise<{
    fileName: string;
    downloadUrl: string;
    storagePath: string;
    size: number;
    uploadedAt: Date;
  }> {
    // Check if Firebase is available
    const firebaseAvailable = await this.checkFirebaseAvailability();

    if (!firebaseAvailable) {
      console.log('📤 Using local storage fallback for notes upload');
      return this.uploadToLocalStorage(fileBuffer, fileName, mimeType, subjectName, 'notes', metadata);
    }

    try {
      console.log(`📤 Uploading notes to Firebase Storage for subject: ${subjectName}`);
      console.log(`📤 File: ${fileName}, Size: ${fileBuffer.length} bytes, Type: ${mimeType}`);

      const bucket = this.getBucket(subjectName);
      console.log(`📤 Using bucket: ${bucket.name}`);

      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `notes/Subjects/${timestamp}_${sanitizedFileName}`;

      const file = bucket.file(storagePath);

      // Set metadata
      const fileMetadata = {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: fileName,
            uploadedAt: new Date().toISOString(),
            subject: subjectName,
            ...metadata,
          },
        },
      };

      // Upload file
      await file.save(fileBuffer, fileMetadata);

      // Make file publicly readable (for signed URLs)
      await file.makePublic();

      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      console.log(`✅ Notes uploaded successfully: ${downloadUrl}`);

      return {
        fileName: sanitizedFileName,
        downloadUrl,
        storagePath,
        size: fileBuffer.length,
        uploadedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Firebase notes upload failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));

      // Provide more specific error messages
      if (error.code === 404 && error.message.includes('bucket')) {
        throw new Error(`Firebase Storage bucket does not exist. Please ensure the Firebase project '${SUBJECT_FIREBASE_CONFIGS.default.projectId}' exists and Cloud Storage is enabled.`);
      }

      throw new Error(`Failed to upload notes: ${error.message}`);
    }
  }

  /**
   * Generate signed download URL for video (valid for 10-30 minutes)
   */
  static async generateVideoSignedUrl(
    storagePath: string,
    subjectName: string = 'default',
    expiresInMinutes: number = 20
  ): Promise<string> {
    // Check if this is a local file path (starts with videos/ or notes/)
    if (storagePath.startsWith('videos/') || storagePath.startsWith('notes/')) {
      // This is a local file, return the local URL
      const localUrl = `${process.env.API_URL || 'http://172.20.10.4:5000'}/uploads/${storagePath}`;
      console.log(`✅ Local video URL generated: ${localUrl}`);
      return localUrl;
    }

    // Firebase path - generate signed URL
    try {
      console.log(`🔗 Generating signed URL for video: ${storagePath}`);

      const bucket = this.getBucket(subjectName);
      const file = bucket.file(storagePath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('Video file not found');
      }

      // Generate signed URL (expires in specified minutes)
      const expires = Date.now() + (expiresInMinutes * 60 * 1000);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires,
      });

      console.log(`✅ Signed URL generated (expires in ${expiresInMinutes} minutes)`);
      return signedUrl;
    } catch (error: any) {
      console.error('❌ Failed to generate signed video URL:', error);
      throw new Error(`Failed to generate signed video URL: ${error.message}`);
    }
  }

  /**
   * Generate signed download URL for notes (valid for 10-30 minutes)
   */
  static async generateNotesSignedUrl(
    storagePath: string,
    subjectName: string = 'default',
    expiresInMinutes: number = 20
  ): Promise<string> {
    // Check if this is a local file path (starts with videos/ or notes/)
    if (storagePath.startsWith('videos/') || storagePath.startsWith('notes/')) {
      // This is a local file, return the local URL
      const localUrl = `${process.env.API_URL || 'http://172.20.10.4:5000'}/uploads/${storagePath}`;
      console.log(`✅ Local notes URL generated: ${localUrl}`);
      return localUrl;
    }

    // Firebase path - generate signed URL
    try {
      console.log(`🔗 Generating signed URL for notes: ${storagePath}`);

      const bucket = this.getBucket(subjectName);
      const file = bucket.file(storagePath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('Notes file not found');
      }

      // Generate signed URL (expires in specified minutes)
      const expires = Date.now() + (expiresInMinutes * 60 * 1000);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires,
      });

      console.log(`✅ Signed URL generated (expires in ${expiresInMinutes} minutes)`);
      return signedUrl;
    } catch (error: any) {
      console.error('❌ Failed to generate signed notes URL:', error);
      throw new Error(`Failed to generate signed notes URL: ${error.message}`);
    }
  }

  /**
   * Delete file from Firebase Storage
   */
  static async deleteFile(
    storagePath: string,
    subjectName: string = 'default'
  ): Promise<void> {
    try {
      console.log(`🗑️ Deleting file from Firebase Storage: ${storagePath}`);

      const bucket = this.getBucket(subjectName);
      const file = bucket.file(storagePath);

      await file.delete();
      console.log(`✅ File deleted successfully: ${storagePath}`);
    } catch (error: any) {
      console.error('❌ Failed to delete file from Firebase Storage:', error);
      // Don't throw error for deletion failures - log and continue
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(
    storagePath: string,
    subjectName: string = 'default'
  ): Promise<any> {
    try {
      const bucket = this.getBucket(subjectName);
      const file = bucket.file(storagePath);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error: any) {
      console.error('❌ Failed to get file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Check if subject has Firebase configuration
   */
  static hasSubjectConfig(subjectName: string): boolean {
    return SUBJECT_FIREBASE_CONFIGS[subjectName] !== undefined || SUBJECT_FIREBASE_CONFIGS.default.projectId !== '';
  }

  /**
   * Get available subjects with Firebase configs
   */
  static getAvailableSubjects(): string[] {
    return Object.keys(SUBJECT_FIREBASE_CONFIGS);
  }
}

export default FirebaseService;