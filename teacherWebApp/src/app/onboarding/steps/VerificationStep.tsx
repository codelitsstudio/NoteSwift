"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Eye,
  Download,
} from 'lucide-react';

type DocCategory = 'citizenship' | 'education' | 'experience' | 'photo' | string;

interface CategoryFile {
  file: File;
  category: DocCategory;
}

interface VerificationData {
  profilePhoto?: File;
  agreementAccepted: boolean;
}

interface UploadProgressMap {
  [key: string]: number;
}

interface UploadErrorsMap {
  [key: string]: string;
}

interface VerificationStepProps {
  data: VerificationData;
  onUpdate: (data: VerificationData) => void;
  uploadProgress?: UploadProgressMap;
  uploadErrors?: UploadErrorsMap;
}

const requiredDocuments = [
  { id: 'citizenship', title: 'Citizenship Certificate', description: 'Clear copy of your citizenship certificate or national ID', required: true },
  { id: 'education', title: 'Educational Certificates', description: 'Copies of your degree certificates and transcripts', required: true },
  { id: 'experience', title: 'Experience Letters', description: 'Letters from previous institutions (if applicable)', required: false },
  { id: 'photo', title: 'Professional Photo', description: 'Clear professional headshot for your profile', required: true },
];

export default function VerificationStep({ data, onUpdate, uploadProgress = {}, uploadErrors = {} }: VerificationStepProps) {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(data.profilePhoto || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(data.agreementAccepted || false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setProfilePhoto(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onUpdate({ profilePhoto: file, agreementAccepted });
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onUpdate({ profilePhoto: undefined, agreementAccepted });
  };

  const handleAgreementChange = (checked: boolean) => {
    setAgreementAccepted(checked);
    onUpdate({ profilePhoto: profilePhoto || undefined, agreementAccepted: checked });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Photo</h3>
        <p className="text-gray-600">Upload a professional headshot for your teacher profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="w-5 h-5 mr-2" /> Professional Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Photo Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
                  />
                  <div className="text-sm text-gray-600">
                    {profilePhoto?.name} ({formatFileSize(profilePhoto?.size || 0)})
                  </div>
                  {uploadProgress[profilePhoto?.name || ''] !== undefined && (
                    <div className="w-full max-w-xs mx-auto">
                      <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                        <div className="bg-blue-500 h-2" style={{ width: `${uploadProgress[profilePhoto?.name || '']}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadProgress[profilePhoto?.name || '']}%</p>
                    </div>
                  )}
                  {uploadErrors[profilePhoto?.name || ''] && (
                    <p className="text-xs text-red-600">Error: {uploadErrors[profilePhoto?.name || '']}</p>
                  )}
                  <Button variant="outline" onClick={removePhoto} className="text-red-600">
                    <X className="w-4 h-4 mr-2" /> Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Click to upload your professional photo</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> Choose Photo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>

            {/* Photo Guidelines */}
            <Alert>
              <Eye className="w-4 h-4" />
              <AlertDescription>
                <strong>Photo Guidelines:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use a clear, professional headshot</li>
                  <li>Face should be clearly visible</li>
                  <li>Use good lighting and neutral background</li>
                  <li>Avoid sunglasses or hats</li>
                  <li>File size should be under 5MB</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2" />Privacy & Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Eye className="w-4 h-4" />
            <AlertDescription>Your photo will be securely stored and used for your teacher profile. We follow strict data protection guidelines to ensure your privacy.</AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Terms and Conditions</h4>
            <div className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              <p>By submitting your application, you agree to the following terms:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All information provided is accurate and truthful</li>
                <li>You have the right to teach the subjects you've specified</li>
                <li>You will maintain professional conduct at all times</li>
                <li>You agree to NoteSwift's teacher code of conduct</li>
                <li>You understand that false information may result in account termination</li>
                <li>Your profile may be reviewed and approved before activation</li>
                <li>You consent to background verification if required</li>
              </ul>
              <p className="mt-2"><Button variant="link" className="p-0 h-auto text-blue-600"><Download className="w-3 h-3 mr-1" />Download full terms and conditions</Button></p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox id="agreement" checked={agreementAccepted} onCheckedChange={(checked) => handleAgreementChange(checked as boolean)} className="mt-1" />
            <Label htmlFor="agreement" className="text-sm leading-relaxed">I agree to the terms and conditions, privacy policy, and teacher code of conduct. I confirm that all information provided is accurate and I consent to verification of my credentials. *</Label>
          </div>
        </CardContent>
      </Card>

      {!profilePhoto && (
        <Alert variant="destructive"><AlertCircle className="w-4 h-4" /><AlertDescription>Please upload a profile photo to proceed.</AlertDescription></Alert>
      )}

      {!agreementAccepted && (
        <Alert variant="destructive"><AlertCircle className="w-4 h-4" /><AlertDescription>You must accept the terms and conditions to complete your registration.</AlertDescription></Alert>
      )}

      {profilePhoto && agreementAccepted && (
        <Alert className="border-green-200 bg-green-50"><CheckCircle className="w-4 h-4 text-green-600" /><AlertDescription className="text-green-700">Great! You're ready to submit your application. Click "Complete Setup" to finish.</AlertDescription></Alert>
      )}
    </div>
  );
}