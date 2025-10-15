'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import PersonalInfoStep from './steps/PersonalInfoStep';
import ProfessionalInfoStep from './steps/ProfessionalInfoStep';
import QualificationsStep from './steps/QualificationsStep';
import VerificationStep from './steps/VerificationStep';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface OnboardingData {
  personalInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };
  professionalInfo: {
    institution: {
      name: string;
      type: string;
      address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
      };
    };
    subjects: Array<{
      name: string;
      level: string;
      experience: number;
    }>;
    experience: {
      totalYears: number;
      previousPositions: Array<{
        title: string;
        institution: string;
        startDate: string;
        endDate: string;
        description: string;
      }>;
    };
    bio: string;
  };
  qualifications: Array<{
    degree: string;
    field: string;
    institution: string;
    year: number;
    grade: string;
  }>;
  verification: {
    profilePhoto?: File;
    agreementAccepted: boolean;
  };
}

const steps = [
  {
    id: 'personal_info',
    title: 'Personal Information',
    description: 'Tell us about yourself',
  },
  {
    id: 'professional_info',
    title: 'Professional Details',
    description: 'Your teaching background',
  },
  {
    id: 'qualifications',
    title: 'Qualifications',
    description: 'Your education and certifications',
  },
  {
    id: 'verification',
    title: 'Verification',
    description: 'Complete your profile setup',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
    },
    professionalInfo: {
      institution: {
        name: '',
        type: 'school',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
        },
      },
      subjects: [],
      experience: {
        totalYears: 0,
        previousPositions: [],
      },
      bio: '',
    },
    qualifications: [],
      verification: {
        agreementAccepted: false,
      },
  });

  // Check if user is authenticated and needs onboarding
  useEffect(() => {
    // Small delay to ensure localStorage is set after redirect
    const checkAuth = () => {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        router.push('/login');
        return;
      }
      // Remove any lingering teacherId
      localStorage.removeItem('teacherId');
    };

    // Check immediately and also after a short delay
    checkAuth();
    const timeoutId = setTimeout(checkAuth, 200);

    return () => clearTimeout(timeoutId);
  }, [router]);

  const updateOnboardingData = (stepKey: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [stepKey]: data,
    }));
  };

  const handleNext = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('teacherToken');

      // Get current step data
      const step = steps[currentStep];
      let stepData;

      switch (step.id) {
        case 'personal_info':
          stepData = onboardingData.personalInfo;
          break;
        case 'professional_info':
          stepData = onboardingData.professionalInfo;
          // Debug log actual values before validation
          console.log('Debug institution:', {
            name: stepData.institution.name,
            type: stepData.institution.type,
            full: stepData.institution
          });
          // Frontend validation for institution name/type
          if (!stepData.institution.name || !stepData.institution.type) {
            toast({
              title: 'Missing Institution Info',
              description: `Please enter both institution name and type.`,
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }
          // Validate subjects array
          if (!Array.isArray(stepData.subjects) || stepData.subjects.length === 0) {
            toast({
              title: 'Missing Subjects',
              description: 'Please add at least one subject you can teach.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }
          // Check required fields in each subject
          for (const subject of stepData.subjects) {
            if (!subject.name || !subject.level) {
              toast({
                title: 'Incomplete Subject',
                description: 'Please fill subject name and level for all subjects.',
                variant: 'destructive',
              });
              setIsLoading(false);
              return;
            }
          }
          break;
        case 'qualifications':
          stepData = onboardingData.qualifications;
          // Debug log actual qualifications payload
          console.log('Debug qualifications payload:', stepData);
          // Frontend validation for qualifications
          if (!Array.isArray(stepData) || stepData.length === 0) {
            toast({
              title: 'Missing Qualifications',
              description: 'Please add at least one qualification.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }
          // Check required fields in each qualification
          for (const qual of stepData) {
            if (!qual.degree || !qual.field || !qual.institution || !qual.year) {
              toast({
                title: 'Incomplete Qualification',
                description: 'Please fill all required fields for each qualification.',
                variant: 'destructive',
              });
              setIsLoading(false);
              return;
            }
          }
          break;
        case 'verification':
          stepData = onboardingData.verification;
          // Validate profile photo is uploaded
          if (!stepData.profilePhoto) {
            toast({
              title: 'Missing Profile Photo',
              description: 'Please upload your profile photo to continue.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }
          // Validate agreement is accepted
          if (!stepData.agreementAccepted) {
            toast({
              title: 'Agreement Required',
              description: 'Please accept the terms and agreement to continue.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }
          break;
      }

      // Debug log payload
      if (step.id === 'professional_info') {
        console.log('Submitting professional_info:', stepData);
      }
      if (step.id === 'verification' && stepData) {
        const verificationData = stepData as OnboardingData['verification'];
        console.log('Submitting verification with photo:', {
          hasPhoto: !!verificationData.profilePhoto,
          photoName: verificationData.profilePhoto?.name,
          agreementAccepted: verificationData.agreementAccepted
        });
      }

      // If verification step includes profile photo, upload it and include in payload
      let payloadData: any;
      if (step.id === 'verification') {
        const verification = stepData as any;
        let uploadedPhoto: any = null;
        setUploadProgress({});
        setUploadErrors({});

        if (verification.profilePhoto) {
          try {
            const file = verification.profilePhoto;
            // get teacher id
            let teacherId = 'temp';
            try {
              const tk = localStorage.getItem('teacherToken');
              if (tk) {
                const decoded = JSON.parse(Buffer.from(tk, 'base64').toString('utf-8'));
                teacherId = decoded.id || teacherId;
              }
            } catch (e) {}

            // get sign data once
            const signRes = await fetch(`${API_ENDPOINTS.BASE}/api/teacher/upload/sign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ folder: `teacher_profiles/${teacherId}` }),
            });
            const signJson = await signRes.json().catch(() => null);
            const signData = signJson && !signJson.error ? signJson.data : null;
            if (!signData) {
              throw new Error('Failed to retrieve upload signature from server');
            }

            const form = new FormData();
            form.append('file', file);
            form.append('api_key', signData.apiKey || '');
            form.append('timestamp', (signData.timestamp || Math.round(Date.now()/1000)).toString());
            form.append('folder', signData.folder || `teacher_profiles/${teacherId}`);
            if (signData.signature) form.append('signature', signData.signature);

            const uploadResult = await new Promise<any>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              const cloudName = signData.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
              xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const percent = Math.round((event.loaded / event.total) * 100);
                  setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                }
              };
              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('Invalid upload response')); }
                } else { reject(new Error(`Upload failed with status ${xhr.status}`)); }
              };
              xhr.onerror = () => reject(new Error('Network error during upload'));
              xhr.send(form);
            });

            uploadedPhoto = {
              name: file.name,
              mimeType: file.type,
              size: file.size,
              url: uploadResult.secure_url || uploadResult.url,
              publicId: uploadResult.public_id,
              uploadedAt: new Date().toISOString(),
            };
            console.log('✅ Photo uploaded to Cloudinary:', {
              url: uploadedPhoto.url,
              publicId: uploadedPhoto.publicId,
              size: uploadedPhoto.size
            });
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          } catch (err: any) {
            console.error('❌ Upload error', err);
            setUploadErrors(prev => ({ ...prev, [verification.profilePhoto.name]: err.message || 'Upload failed' }));
            throw err;
          }
        } else {
          console.warn('⚠️  No profile photo selected for upload');
        }

        payloadData = { profilePhoto: uploadedPhoto, agreementAccepted: verification.agreementAccepted };
        console.log('📤 Sending verification payload:', {
          hasPhoto: !!payloadData.profilePhoto,
          photoUrl: payloadData.profilePhoto?.url,
          agreementAccepted: payloadData.agreementAccepted
        });
      } else {
        payloadData = step.id === 'qualifications' ? { qualifications: stepData } : stepData;
      }

      const response = await fetch(API_ENDPOINTS.AUTH.ONBOARDING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          step: step.id,
          data: payloadData,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.message);
      }

      // If not the last step, move to next
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Last step completed
        toast({
          title: 'Onboarding Complete!',
          description: 'Your profile has been submitted for review. You will be notified once approved.',
        });

        // Redirect to pending approval page
        router.push('/pending-approval');
      }
      
    } catch (error: any) {
      console.error('Onboarding step error:', error);
      toast({
        title: 'Step Failed',
        description: error.message || 'Failed to save this step. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };



  const renderCurrentStep = () => {
    switch (steps[currentStep].id) {
      case 'personal_info':
        return (
          <PersonalInfoStep
            data={onboardingData.personalInfo}
            onUpdate={(data: OnboardingData['personalInfo']) => updateOnboardingData('personalInfo', data)}
          />
        );
      case 'professional_info':
        return (
          <ProfessionalInfoStep
            data={onboardingData.professionalInfo}
            onUpdate={(data: OnboardingData['professionalInfo']) => updateOnboardingData('professionalInfo', data)}
          />
        );
      case 'qualifications':
        return (
          <QualificationsStep
            data={onboardingData.qualifications}
            onUpdate={(data: OnboardingData['qualifications']) => updateOnboardingData('qualifications', data)}
          />
        );
      case 'verification':
        return (
          <VerificationStep
            data={onboardingData.verification}
            onUpdate={(data: OnboardingData['verification']) => updateOnboardingData('verification', data)}
            uploadProgress={uploadProgress}
            uploadErrors={uploadErrors}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to NoteSwift Teacher
          </h1>
          <p className="text-gray-600">
            Complete your profile to start teaching and inspire students
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center"
          >
            {currentStep === steps.length - 1 ? (
              <>
                {isLoading ? 'Submitting...' : 'Complete Setup'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}