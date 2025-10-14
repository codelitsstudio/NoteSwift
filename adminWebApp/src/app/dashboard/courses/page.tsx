'use client';

import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen, Star, School, PlayCircle } from 'lucide-react';

interface Course {
  _id?: string;
  title: string;
  description: string;
  subjects?: {
    name: string;
    modules?: {
      name: string;
      description: string;
      duration?: string;
    }[];
  }[];
  tags: string[];
  status: string;
  type: 'pro' | 'free' | 'featured';
  price?: number;
  program?: string;
  duration?: string;
  rating?: number;
  enrolledCount?: number;
  skills?: string[];
  features?: string[];
  learningPoints?: string[];
  offeredBy?: string;
  courseOverview?: string;
  syllabus?: {
    moduleNumber: number;
    title: string;
    description: string;
  }[];
  faq?: {
    question: string;
    answer: string;
  }[];
  icon?: string;
  isFeatured?: boolean;
}

// Valid Material Icons for courses (used in student frontend)
const VALID_MATERIAL_ICONS = [
  { value: 'school', label: 'School', description: 'General education/courses' },
  { value: 'menu-book', label: 'Book', description: 'Learning materials' },
  { value: 'auto-stories', label: 'Stories', description: 'Books and stories' },
  { value: 'play-circle-filled', label: 'Video', description: 'Videos and lectures' },
  { value: 'live-tv', label: 'Live TV', description: 'Live classes' },
  { value: 'library-books', label: 'Library', description: 'Study materials' },
  { value: 'quiz', label: 'Quiz', description: 'Tests and exams' },
  { value: 'assignment', label: 'Assignment', description: 'Homework and tasks' },
  { value: 'psychology', label: 'Psychology', description: 'Career counseling' },
  { value: 'explore', label: 'Explore', description: 'Platform tours' },
  { value: 'account-balance', label: 'Institution', description: 'Board exams' },
  { value: 'star', label: 'Star', description: 'Premium content' },
  { value: 'science', label: 'Science', description: 'Science subjects' },
  { value: 'calculate', label: 'Math', description: 'Mathematics' },
  { value: 'language', label: 'Language', description: 'Languages' },
  { value: 'palette', label: 'Art', description: 'Arts and creativity' },
  { value: 'music-note', label: 'Music', description: 'Music and arts' },
  { value: 'sports-basketball', label: 'Sports', description: 'Physical education' },
  { value: 'computer', label: 'Computer', description: 'Computer science' },
  { value: 'history', label: 'History', description: 'History and social studies' },
] as const;

export default function CoursesManagementPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState('pro');

  // Homepage display settings
  const [homepageSettings, setHomepageSettings] = useState({
    selectedFeaturedCourses: [] as string[],
  });
  const [homepageSettingsLoading, setHomepageSettingsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Course>({
    title: '',
    description: '',
    subjects: [],
    tags: [],
    status: 'Draft',
    type: 'pro',
    price: 0,
    program: '',
    duration: '',
    rating: 0,
    enrolledCount: 0,
    skills: [],
    features: [],
    learningPoints: [],
    offeredBy: '',
    courseOverview: '',
    syllabus: [],
    faq: [],
    icon: '',
    isFeatured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load homepage settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('homepageSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Handle migration from old format
        if (parsedSettings.featuredDisplayMode) {
          // If old format, convert to new format
          const selectedCourses = parsedSettings.featuredDisplayMode === 'all' 
            ? courses.filter(course => course.type === 'featured').map(c => c._id!)
            : parsedSettings.selectedFeaturedCourses || [];
          setHomepageSettings({ selectedFeaturedCourses: selectedCourses });
        } else {
          setHomepageSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error loading homepage settings:', error);
      }
    }
  }, [courses]);

  // Auto-save homepage settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('homepageSettings', JSON.stringify(homepageSettings));
  }, [homepageSettings]);

  // Fetch homepage settings from backend
  const fetchHomepageSettings = async () => {
    try {
      const res = await fetch('/api/admin/homepage-settings');
      if (!res.ok) throw new Error('Failed to fetch homepage settings');
      const data = await res.json();
      if (data.success) {
        setHomepageSettings({
          selectedFeaturedCourses: data.data.selectedFeaturedCourses || []
        });
      }
    } catch (error) {
      console.error('Error fetching homepage settings:', error);
      toast({ title: 'Error', description: 'Failed to load homepage settings' });
    } finally {
      setHomepageSettingsLoading(false);
    }
  };

  // Save homepage settings to backend
  const saveHomepageSettings = async (settings: typeof homepageSettings) => {
    try {
      const res = await fetch('/api/admin/homepage-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save homepage settings');
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Homepage settings saved successfully' });
        return true;
      }
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      toast({ title: 'Error', description: 'Failed to save homepage settings' });
      return false;
    }
    return false;
  };

  // Load homepage settings on component mount
  useEffect(() => {
    fetchHomepageSettings();
  }, []);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Auto-save form data to localStorage whenever formData changes
  useEffect(() => {
    if (!editingCourse) {
      const cleanData = { ...formData };
      delete (cleanData as any).subject; // Ensure no old subject field
      localStorage.setItem('courseFormDraft', JSON.stringify(cleanData));
    }
  }, [formData, editingCourse]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const json = await res.json();
      setCourses(json.result?.courses || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!validateForm()) {
      toast({ title: 'Error', description: 'Please fix the errors in the form' });
      return;
    }

    try {
      const method = editingCourse ? 'PUT' : 'POST';
      const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';

      console.log('Sending formData:', formData); // Debug log

      // Ensure we only send the correct fields (remove any old 'subject' field if it exists)
      const cleanFormData = { ...formData };
      delete (cleanFormData as any).subject; // Remove any old subject field

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormData),
      });

      if (!res.ok) throw new Error('Failed to save course');

      toast({
        title: 'Success',
        description: `Course ${editingCourse ? 'updated' : 'created'} successfully`
      });

      setIsDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save course' });
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');

      toast({ title: 'Success', description: 'Course deleted successfully' });
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to delete course' });
    }
  };

  const handleAddUpcomingTag = async (courseId: string) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      const updatedTags = [...(course.tags || []), 'upcoming'];
      const updatedCourse = { ...course, tags: updatedTags };

      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourse),
      });

      if (!res.ok) throw new Error('Failed to update course');

      toast({ title: 'Success', description: 'Course marked as upcoming' });
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to mark course as upcoming' });
    }
  };

  const handleRemoveUpcomingTag = async (courseId: string) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      const updatedTags = (course.tags || []).filter(tag => tag !== 'upcoming');
      const updatedCourse = { ...course, tags: updatedTags };

      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourse),
      });

      if (!res.ok) throw new Error('Failed to update course');

      toast({ title: 'Success', description: 'Course removed from upcoming' });
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to remove course from upcoming' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subjects: [{ name: '', modules: [] }],
      tags: [],
      status: 'Draft',
  type: 'pro',
      price: 0,
      program: '',
      duration: '',
      rating: 0,
      enrolledCount: 0,
      skills: [],
      features: [],
      learningPoints: [],
      offeredBy: '',
      courseOverview: '',
      syllabus: [],
      faq: [],
      icon: '',
      isFeatured: false,
    });
    setEditingCourse(null);
    setErrors({});
    // Do NOT clear localStorage draft here; only clear after successful course creation/update
  };

  // Array management functions
  const addArrayItem = (field: keyof Course, value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[] || []), value.trim()]
    }));
  };

  const removeArrayItem = (field: keyof Course, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[] || []).filter((_, i) => i !== index)
    }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...(prev.subjects || []), { name: '', modules: [] }]
    }));
  };

  const updateSubject = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: (prev.subjects || []).map((subject, i) =>
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: (prev.subjects || []).filter((_, i) => i !== index)
    }));
  };

  const addModuleToSubject = (subjectIndex: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: (prev.subjects || []).map((subject, i) =>
        i === subjectIndex
          ? { ...subject, modules: [...(subject.modules || []), { name: '', duration: '', description: '' }] }
          : subject
      )
    }));
  };

  const updateModuleInSubject = (subjectIndex: number, moduleIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: (prev.subjects || []).map((subject, i) =>
        i === subjectIndex
          ? {
              ...subject,
              modules: (subject.modules || []).map((module, j) =>
                j === moduleIndex ? { ...module, [field]: value } : module
              )
            }
          : subject
      )
    }));
  };

  const removeModuleFromSubject = (subjectIndex: number, moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: (prev.subjects || []).map((subject, i) =>
        i === subjectIndex
          ? { ...subject, modules: (subject.modules || []).filter((_, j) => j !== moduleIndex) }
          : subject
      )
    }));
  };

  const addSyllabusItem = () => {
    setFormData(prev => ({
      ...prev,
      syllabus: [...(prev.syllabus || []), { moduleNumber: (prev.syllabus || []).length + 1, title: '', description: '' }]
    }));
  };

  const updateSyllabusItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      syllabus: (prev.syllabus || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeSyllabusItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      syllabus: (prev.syllabus || []).filter((_, i) => i !== index).map((item, i) => ({ ...item, moduleNumber: i + 1 }))
    }));
  };

  const addFaqItem = () => {
    setFormData(prev => ({
      ...prev,
      faq: [...(prev.faq || []), { question: '', answer: '' }]
    }));
  };

  const updateFaqItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      faq: (prev.faq || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeFaqItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: (prev.faq || []).filter((_, i) => i !== index)
    }));
  };

  const openCreateDialog = (type: 'pro' | 'free') => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    router.push(`/dashboard/courses/${course._id}`);
  };

  // Validation functions
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    // Type-specific validations
    if (formData.type === 'pro') {
      if (formData.price === undefined || formData.price < 0) newErrors.price = 'Valid price is required for pro courses';
    }

    // Validate icon selection
    if (!formData.icon?.trim()) {
      newErrors.icon = 'Please select an icon for the course';
    } else if (!VALID_MATERIAL_ICONS.some(icon => icon.value === formData.icon)) {
      newErrors.icon = 'Please select a valid icon from the list';
    }

    // Validate modules for pro/free courses
    if ((formData.type === 'pro' || formData.type === 'free') && formData.subjects) {
      formData.subjects.forEach((subject, subjectIndex) => {
        if (!subject.name.trim()) newErrors[`subject_${subjectIndex}_name`] = `Subject ${subjectIndex + 1} name is required`;
        if (subject.modules) {
          subject.modules.forEach((module, moduleIndex) => {
            if (!module.name.trim()) newErrors[`subject_${subjectIndex}_module_${moduleIndex}_name`] = `Module ${moduleIndex + 1} in ${subject.name} name is required`;
            if (!module.description.trim()) newErrors[`subject_${subjectIndex}_module_${moduleIndex}_description`] = `Module ${moduleIndex + 1} in ${subject.name} description is required`;
          });
        }
      });
    }

    // Validate array fields for empty entries
    if (formData.skills?.some(skill => !skill.trim())) {
      newErrors.skills = 'All skills must have content';
    }
    if (formData.features?.some(feature => !feature.trim())) {
      newErrors.features = 'All features must have content';
    }
    if (formData.learningPoints?.some(point => !point.trim())) {
      newErrors.learningPoints = 'All learning points must have content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredCourses = courses.filter(course => course.type === activeTab);

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Course Management</h1>
            <p className="text-gray-600">Create and manage courses for students</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pro" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Pro Courses
            </TabsTrigger>
            <TabsTrigger value="free" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Free Courses
            </TabsTrigger>
            <TabsTrigger value="homepage" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Homepage
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Create Button - Only show for pro/free tabs, not homepage */}
            {activeTab !== 'homepage' && (
              <div className="flex justify-end">
                <Button onClick={() => router.push('/dashboard/courses/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Course
                </Button>
              </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course._id} className="group hover:shadow-md transition-all duration-300 border hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                    
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1 leading-tight flex-1 mr-3">
                              {course.title}
                            </CardTitle>
                            <Badge
                              variant={course.status === 'Published' ? 'default' : 'secondary'}
                              className={`text-xs font-medium flex-shrink-0 ${
                                course.status === 'Published'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price and Type Section */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {course.price !== undefined && course.price > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">₹{course.price}</span>
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                              Pro
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 px-3 py-1">
                            <span className="flex items-center gap-1">
                              <PlayCircle className="w-3 h-3" />
                              Free Course
                            </span>
                          </Badge>
                        )}
                      </div>
                      {course.enrolledCount !== undefined && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <School className="w-3 h-3" />
                          {course.enrolledCount} enrolled
                        </div>
                      )}
                    </div>

                    {/* Course Stats */}
                    {(course.rating || course.duration) && (
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {course.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
                            <span className="font-medium">{course.rating}</span>
                          </div>
                        )}
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            <span>{course.duration}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        onClick={() => openEditDialog(course)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Course
                      </Button>
                      <Button
                        onClick={() => handleDelete(course._id!)}
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && activeTab !== 'homepage' && (
              <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-100 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BookOpen className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No {activeTab} courses yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Create your first {activeTab} course to get started. Add engaging content and help students learn effectively.
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/courses/new')}
                    className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Course
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="homepage" className="space-y-6">
            <div className="space-y-6">
              {/* Featured Courses Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Featured Courses Display
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Choose which featured courses to display on the student homepage
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary and Quick Actions */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">
                            {homepageSettings.selectedFeaturedCourses.length} of {courses.filter(course => course.type === 'featured').length}
                          </span>
                          <span className="text-gray-600 ml-1">courses will be shown</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Shown</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <span className="text-xs text-gray-600">Hidden</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            const newSettings = { ...homepageSettings, selectedFeaturedCourses: [] };
                            setHomepageSettings(newSettings);
                            await saveHomepageSettings(newSettings);
                          }}
                          size="sm"
                          variant="outline"
                          disabled={homepageSettings.selectedFeaturedCourses.length === 0}
                        >
                          Hide All
                        </Button>
                        <Button
                          onClick={async () => {
                            const newSettings = { 
                              ...homepageSettings, 
                              selectedFeaturedCourses: courses.filter(course => course.type === 'featured').map(c => c._id!) 
                            };
                            setHomepageSettings(newSettings);
                            await saveHomepageSettings(newSettings);
                          }}
                          size="sm"
                          variant="default"
                          disabled={homepageSettings.selectedFeaturedCourses.length === courses.filter(course => course.type === 'featured').length}
                        >
                          Show All
                        </Button>
                      </div>
                    </div>

                    {/* Featured Courses Grid */}
                    {courses.filter(course => course.type === 'featured').length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.filter(course => course.type === 'featured').map((course) => {
                          const isDisplayed = homepageSettings.selectedFeaturedCourses.includes(course._id!);
                          return (
                            <Card key={course._id} className={`relative transition-all duration-200 ${
                              isDisplayed
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              {/* Status Indicator */}
                              <div className={`absolute top-3 right-3 w-4 h-4 rounded-full ${
                                isDisplayed ? 'bg-blue-500' : 'bg-gray-300'
                              }`}></div>

                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Course Info */}
                                  <div>
                                    <h4 className="font-medium text-sm line-clamp-2">{course.title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{course.description}</p>
                                  </div>

                                  {/* Course Details */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={course.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
                                        {course.status}
                                      </Badge>
                                      {course.price !== undefined && course.price > 0 && (
                                        <span className="text-xs font-semibold text-blue-600">₹{course.price}</span>
                                      )}
                                      {course.price === 0 && (
                                        <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                                          Free
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                                    <Button
                                      onClick={async () => {
                                        const selected = homepageSettings.selectedFeaturedCourses;
                                        const newSelected = isDisplayed
                                          ? selected.filter(id => id !== course._id)
                                          : [...selected, course._id!];
                                        const newSettings = { ...homepageSettings, selectedFeaturedCourses: newSelected };
                                        setHomepageSettings(newSettings);
                                        await saveHomepageSettings(newSettings);
                                      }}
                                      size="sm"
                                      variant={isDisplayed ? "default" : "outline"}
                                      className="flex-1 text-xs"
                                    >
                                      {isDisplayed ? "Hide from Homepage" : "Show on Homepage"}
                                    </Button>
                                    <Button
                                      onClick={() => router.push(`/dashboard/courses/${course._id}`)}
                                      size="sm"
                                      variant="outline"
                                      className="px-2"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No featured courses available
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Create some featured courses first to manage their homepage display.
                        </p>
                        <Button onClick={() => router.push('/dashboard/courses/new?type=featured')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Featured Course
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Courses Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Upcoming Courses Display
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Choose which draft courses to display as upcoming on the student homepage
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary and Quick Actions */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">
                            {courses.filter(course => course.tags?.includes('upcoming')).length} of {courses.filter(course => course.status === 'Draft').length}
                          </span>
                          <span className="text-gray-600 ml-1">draft courses marked as upcoming</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Upcoming</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <span className="text-xs text-gray-600">Draft</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            // Remove 'upcoming' tag from all draft courses
                            courses.filter(course => course.status === 'Draft' && course.tags?.includes('upcoming')).forEach(course => {
                              handleRemoveUpcomingTag(course._id!);
                            });
                          }}
                          size="sm"
                          variant="outline"
                          disabled={courses.filter(course => course.tags?.includes('upcoming')).length === 0}
                        >
                          Clear All
                        </Button>
                        <Button
                          onClick={() => {
                            // Add 'upcoming' tag to all draft courses
                            courses.filter(course => course.status === 'Draft' && !course.tags?.includes('upcoming')).forEach(course => {
                              handleAddUpcomingTag(course._id!);
                            });
                          }}
                          size="sm"
                          variant="default"
                          disabled={courses.filter(course => course.status === 'Draft' && !course.tags?.includes('upcoming')).length === 0}
                        >
                          Mark All
                        </Button>
                      </div>
                    </div>

                    {/* Draft Courses Grid */}
                    {courses.filter(course => course.status === 'Draft').length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.filter(course => course.status === 'Draft').map((course) => {
                          const isUpcoming = course.tags?.includes('upcoming');
                          return (
                            <Card key={course._id} className={`relative transition-all duration-200 ${
                              isUpcoming
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              {/* Status Indicator */}
                              <div className={`absolute top-3 right-3 w-4 h-4 rounded-full ${
                                isUpcoming ? 'bg-blue-500' : 'bg-gray-300'
                              }`}></div>

                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Course Info */}
                                  <div>
                                    <h4 className="font-medium text-sm line-clamp-2">{course.title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{course.description}</p>
                                  </div>

                                  {/* Course Details */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {course.status}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">{course.type}</Badge>
                                      {course.price !== undefined && course.price > 0 && (
                                        <span className="text-xs font-semibold text-blue-600">₹{course.price}</span>
                                      )}
                                      {course.price === 0 && (
                                        <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                                          Free
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                                    <Button
                                      onClick={() => {
                                        if (isUpcoming) {
                                          handleRemoveUpcomingTag(course._id!);
                                        } else {
                                          handleAddUpcomingTag(course._id!);
                                        }
                                      }}
                                      size="sm"
                                      variant={isUpcoming ? "default" : "outline"}
                                      className="flex-1 text-xs"
                                    >
                                      {isUpcoming ? "Remove from Upcoming" : "Mark as Upcoming"}
                                    </Button>
                                    <Button
                                      onClick={() => router.push(`/dashboard/courses/${course._id}`)}
                                      size="sm"
                                      variant="outline"
                                      className="px-2"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No draft courses available
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Create some draft courses first to manage their upcoming status.
                        </p>
                        <Button onClick={() => router.push('/dashboard/courses/new')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Draft Course
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CourseEditor modal removed. Use dedicated page for create/edit/view. */}
  </div>

  );
}