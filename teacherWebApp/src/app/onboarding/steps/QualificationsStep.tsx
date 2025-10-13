'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Plus, X, Award } from 'lucide-react';

interface Qualification {
  degree: string;
  field: string;
  institution: string;
  year: number;
  grade: string;
}

interface QualificationsStepProps {
  data: Qualification[];
  onUpdate: (data: Qualification[]) => void;
}

const degreeOptions = [
  'High School/SLC',
  '+2/Intermediate',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD/Doctorate',
  'Diploma',
  'Certificate',
  'Post Graduate Diploma',
];

const fieldOptions = [
  'Education',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English Literature',
  'Nepali Literature',
  'Social Studies',
  'Computer Science',
  'Information Technology',
  'Economics',
  'Accountancy',
  'Business Studies',
  'History',
  'Geography',
  'Political Science',
  'Philosophy',
  'Psychology',
  'Arts',
  'Science',
  'Management',
  'Engineering',
  'Medicine',
  'Law',
  'Other',
];

const gradeOptions = [
  'First Division/A+',
  'Second Division/A',
  'Third Division/B+',
  'Pass/B',
  'Distinction',
  'Merit',
  'Pass',
  'Other',
];

export default function QualificationsStep({ data, onUpdate }: QualificationsStepProps) {


  const [qualifications, setQualifications] = useState<Qualification[]>(
    data.length > 0 ? data : [{ degree: '', field: '', institution: '', year: new Date().getFullYear(), grade: '' }]
  );

  // Always propagate latest qualifications to parent on mount and when data changes
  useEffect(() => {
    onUpdate(qualifications);
    // If data prop changes externally, sync local state
    if (JSON.stringify(data) !== JSON.stringify(qualifications)) {
      setQualifications(data.length > 0 ? data : [{ degree: '', field: '', institution: '', year: new Date().getFullYear(), grade: '' }]);
    }
    // eslint-disable-next-line
  }, [data]);

  // Propagate changes to parent only when qualifications change
  useEffect(() => {
    onUpdate(qualifications);
    // eslint-disable-next-line
  }, [qualifications]);

  const addQualification = () => {
    const updated = [
      ...qualifications,
      { degree: '', field: '', institution: '', year: new Date().getFullYear(), grade: '' },
    ];
    setQualifications(updated);
  };

  const updateQualification = (index: number, field: keyof Qualification, value: string | number) => {
    const updated = qualifications.map((qual, i) =>
      i === index ? { ...qual, [field]: value } : qual
    );
    setQualifications(updated);
  };

  const removeQualification = (index: number) => {
    if (qualifications.length > 1) {
      const updated = qualifications.filter((_, i) => i !== index);
      setQualifications(updated);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Educational Qualifications
        </h3>
        <p className="text-gray-600">
          Add your educational background and certifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Your Qualifications
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addQualification}>
              <Plus className="w-4 h-4 mr-2" />
              Add Qualification
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {qualifications.map((qualification, index) => (
            <div key={index} className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Qualification {index + 1}
                </h4>
                {qualifications.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQualification(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree/Qualification *</Label>
                  <Select
                    value={qualification.degree}
                    onValueChange={(value) => updateQualification(index, 'degree', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {degreeOptions.map((degree) => (
                        <SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Field of Study *</Label>
                  <Select
                    value={qualification.field}
                    onValueChange={(value) => updateQualification(index, 'field', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field of study" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Institution/University *</Label>
                <Input
                  placeholder="Enter the name of your institution"
                  value={qualification.institution}
                  onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year of Graduation *</Label>
                  <Select
                    value={qualification.year.toString()}
                    onValueChange={(value) => updateQualification(index, 'year', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grade/Result *</Label>
                  <Select
                    value={qualification.grade}
                    onValueChange={(value) => updateQualification(index, 'grade', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-base">
            Guidelines for Adding Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Add your highest qualification first</li>
            <li>Include all relevant degrees and certifications</li>
            <li>Teaching certifications and training programs are highly valued</li>
            <li>Make sure all information is accurate as it will be verified</li>
            <li>Include any specialized training in your subject area</li>
          </ul>
        </CardContent>
      </Card>

      {/* Validation Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">
              Qualification Verification
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              All qualifications will be verified during the approval process. 
              Please ensure you have the necessary documents ready for upload in the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}