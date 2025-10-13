'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, BookOpen, Briefcase, Plus, X, MapPin } from 'lucide-react';

interface Subject {
  name: string;
  level: string;
  experience: number;
}

interface PreviousPosition {
  title: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ProfessionalInfoData {
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
  subjects: Subject[];
  experience: {
    totalYears: number;
    previousPositions: PreviousPosition[];
  };
  bio: string;
}

interface ProfessionalInfoStepProps {
  data: ProfessionalInfoData;
  onUpdate: (data: ProfessionalInfoData) => void;
}

const subjectOptions = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Nepali', 'Social Studies', 'Computer Science', 'Economics',
  'Accountancy', 'History', 'Geography', 'Science', 'Arts',
];

const levelOptions = [
  'elementary', 'middle', 'high_school', 'undergraduate', 'graduate', 'professional',
];

export default function ProfessionalInfoStep({ data, onUpdate }: ProfessionalInfoStepProps) {

  const [formData, setFormData] = useState<ProfessionalInfoData>(data);

  // Propagate changes to parent only if formData changes and is different from initial data
  useEffect(() => {
    // Avoid infinite loop by checking if formData is different from data
    if (formData !== data) {
      onUpdate(formData);
    }
  }, [formData, data, onUpdate]);

  const handleInstitutionChange = (field: keyof ProfessionalInfoData['institution'], value: string) => {
    setFormData(prev => ({
      ...prev,
      institution: {
        ...prev.institution,
        [field]: value,
      },
    }));
  };

  const handleInstitutionAddressChange = (field: keyof ProfessionalInfoData['institution']['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      institution: {
        ...prev.institution,
        address: {
          ...prev.institution.address,
          [field]: value,
        },
      },
    }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', level: '', experience: 0 }],
    }));
  };

  const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
    // If updating 'level', map UI value to backend value
    let mappedValue = value;
    if (field === 'level' && typeof value === 'string') {
      // Accept only backend enum values
      mappedValue = value;
    }
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) =>
        i === index ? { ...subject, [field]: mappedValue } : subject
      ),
    }));
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const addPreviousPosition = () => {
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        previousPositions: [
          ...prev.experience.previousPositions,
          { title: '', institution: '', startDate: '', endDate: '', description: '' },
        ],
      },
    }));
  };

  const updatePreviousPosition = (index: number, field: keyof PreviousPosition, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        previousPositions: prev.experience.previousPositions.map((position, i) =>
          i === index ? { ...position, [field]: value } : position
        ),
      },
    }));
  };

  const removePreviousPosition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        previousPositions: prev.experience.previousPositions.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Current Institution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Current Institution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name *</Label>
              <Input
                id="institutionName"
                placeholder="Enter institution name"
                value={formData.institution.name}
                onChange={(e) => handleInstitutionChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institutionType">Institution Type *</Label>
              <Select
                value={formData.institution.type}
                onValueChange={(value) => handleInstitutionChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="institute">Institute</SelectItem>
                  <SelectItem value="training_center">Training Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Institution Address */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Institution Address
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="institutionStreet">Street Address *</Label>
              <Input
                id="institutionStreet"
                placeholder="Enter street address"
                value={formData.institution.address.street}
                onChange={(e) => handleInstitutionAddressChange('street', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institutionCity">City *</Label>
                <Input
                  id="institutionCity"
                  placeholder="Enter city"
                  value={formData.institution.address.city}
                  onChange={(e) => handleInstitutionAddressChange('city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institutionState">State/Province *</Label>
                <Input
                  id="institutionState"
                  placeholder="Enter state or province"
                  value={formData.institution.address.state}
                  onChange={(e) => handleInstitutionAddressChange('state', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Subjects You Teach
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addSubject}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.subjects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Click "Add Subject" to add the subjects you teach
            </p>
          ) : (
            formData.subjects.map((subject, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Subject {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubject(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Subject Name *</Label>
                    <Select
                      value={subject.name}
                      onValueChange={(value) => updateSubject(index, 'name', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((subjectName) => (
                          <SelectItem key={subjectName} value={subjectName}>
                            {subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Level *</Label>
                    <Select
                      value={subject.level}
                      onValueChange={(value) => updateSubject(index, 'level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Experience (Years) *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="50"
                      value={subject.experience}
                      onChange={(e) => updateSubject(index, 'experience', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Teaching Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalYears">Total Years of Teaching Experience *</Label>
            <Input
              id="totalYears"
              type="number"
              placeholder="0"
              min="0"
              max="50"
              value={formData.experience.totalYears}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                experience: {
                  ...prev.experience,
                  totalYears: parseInt(e.target.value) || 0,
                },
              }))}
              required
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Previous Positions</h4>
              <Button type="button" variant="outline" size="sm" onClick={addPreviousPosition}>
                <Plus className="w-4 h-4 mr-2" />
                Add Position
              </Button>
            </div>

            {formData.experience.previousPositions.map((position, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">Position {index + 1}</h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePreviousPosition(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title *</Label>
                    <Input
                      placeholder="e.g., Math Teacher"
                      value={position.title}
                      onChange={(e) => updatePreviousPosition(index, 'title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Institution *</Label>
                    <Input
                      placeholder="Institution name"
                      value={position.institution}
                      onChange={(e) => updatePreviousPosition(index, 'institution', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={position.startDate}
                      onChange={(e) => updatePreviousPosition(index, 'startDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={position.endDate}
                      onChange={(e) => updatePreviousPosition(index, 'endDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={position.description}
                    onChange={(e) => updatePreviousPosition(index, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bio">Tell us about yourself and your teaching philosophy *</Label>
            <Textarea
              id="bio"
              placeholder="Write about your teaching experience, philosophy, and what makes you passionate about education..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={5}
              required
            />
            <p className="text-sm text-gray-500">
              This will be visible to students and parents. Minimum 50 characters.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}