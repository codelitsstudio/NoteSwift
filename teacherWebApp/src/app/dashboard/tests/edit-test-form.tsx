"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import teacherAPI from "@/lib/api/teacher-api";
import { useTeacher } from "@/context/teacher-context";
import { Calendar, Clock, Settings, Users, Bell, Shield, BarChart3, Eye, RotateCcw, Calculator, Target, Save, ArrowLeft, Plus, Trash2, Edit, FileText, CheckCircle, X } from "lucide-react";

export function EditTestForm({ testId, subject, modules, onBack }: { testId: string; subject: any; modules: any[]; onBack: () => void }) {
  const router = useRouter();
  const { teacherEmail } = useTeacher();

  // Basic Info - subject is automatically set from teacher assignment
  const [moduleId, setModuleId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Scheduling
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [deadline, setDeadline] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurringCount, setRecurringCount] = useState<number>(4);

  // Test Configuration
  const [testType, setTestType] = useState<"mcq" | "pdf" | "mixed">("mcq");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [passingScore, setPassingScore] = useState<number>(60);

  // Test Settings
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [allowRetakes, setAllowRetakes] = useState(false);
  const [maxRetakes, setMaxRetakes] = useState<number>(1);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(0); // 0 = no limit
  const [allowCalculator, setAllowCalculator] = useState(false);
  const [partialCredit, setPartialCredit] = useState(false);

  // Access Control
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [restrictIp, setRestrictIp] = useState(false);
  const [allowedIps, setAllowedIps] = useState("");

  // Notifications
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [reminderHours, setReminderHours] = useState<number>(24);

  // Advanced
  const [instructions, setInstructions] = useState("");
  const [tags, setTags] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basic");
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Questions Management
  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    marks: 4,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  // Tab navigation
  const tabs = [
    { id: "basic", label: "Basic", icon: Settings },
    { id: "questions", label: "Questions", icon: FileText },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "settings", label: "Settings", icon: Target },
    { id: "access", label: "Access", icon: Shield },
    { id: "advanced", label: "Advanced", icon: BarChart3 }
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Load test data
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        // For now, we'll simulate loading test data
        // In a real implementation, you'd fetch the test data from the API
        console.log('Loading test data for:', testId);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock test data - replace with actual API call
        const mockTestData = {
          title: "Sample Test",
          description: "Test description",
          moduleId: modules.length > 0 ? (modules[0]._id || `module_${modules[0].moduleNumber}`) : "",
          scheduledAt: "",
          durationMinutes: 60,
          deadline: "",
          testType: "mcq" as const,
          difficulty: "medium" as const,
          totalQuestions: 10,
          passingScore: 60,
          randomizeQuestions: true,
          randomizeOptions: true,
          showResultsImmediately: false,
          allowRetakes: false,
          maxRetakes: 1,
          timePerQuestion: 0,
          allowCalculator: false,
          partialCredit: false,
          requirePassword: false,
          password: "",
          restrictIp: false,
          allowedIps: "",
          notifyStudents: true,
          sendReminders: true,
          reminderHours: 24,
          instructions: "",
          tags: "",
          isDraft: false
        };

        // Set form data
        setTitle(mockTestData.title);
        setDescription(mockTestData.description);
        setModuleId(mockTestData.moduleId);
        setScheduledAt(mockTestData.scheduledAt);
        setDurationMinutes(mockTestData.durationMinutes);
        setDeadline(mockTestData.deadline);
        setTestType(mockTestData.testType);
        setDifficulty(mockTestData.difficulty);
        setTotalQuestions(mockTestData.totalQuestions);
        setPassingScore(mockTestData.passingScore);
        setRandomizeQuestions(mockTestData.randomizeQuestions);
        setRandomizeOptions(mockTestData.randomizeOptions);
        setShowResultsImmediately(mockTestData.showResultsImmediately);
        setAllowRetakes(mockTestData.allowRetakes);
        setMaxRetakes(mockTestData.maxRetakes);
        setTimePerQuestion(mockTestData.timePerQuestion);
        setAllowCalculator(mockTestData.allowCalculator);
        setPartialCredit(mockTestData.partialCredit);
        setRequirePassword(mockTestData.requirePassword);
        setPassword(mockTestData.password);
        setRestrictIp(mockTestData.restrictIp);
        setAllowedIps(mockTestData.allowedIps);
        setNotifyStudents(mockTestData.notifyStudents);
        setSendReminders(mockTestData.sendReminders);
        setReminderHours(mockTestData.reminderHours);
        setInstructions(mockTestData.instructions);
        setTags(mockTestData.tags);
        setIsDraft(mockTestData.isDraft);

        setCompletedTabs(new Set(["basic", "schedule", "settings", "access", "advanced"]));
      } catch (err) {
        console.error('Error loading test data:', err);
        setError('Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadTestData();
    }
  }, [testId, modules]);

  const validateCurrentTab = () => {
    switch (activeTab) {
      case "basic":
        if (!subject) {
          setError("No subject assigned to this teacher");
          return false;
        }
        if (modules.length > 0 && !moduleId) {
          setError("Please select a module");
          return false;
        }
        break;
      case "schedule":
        // Schedule validation is optional
        break;
      case "settings":
        // Settings validation is optional
        break;
      case "access":
        if (requirePassword && !password.trim()) {
          setError("Password is required when password protection is enabled");
          return false;
        }
        if (restrictIp && !allowedIps.trim()) {
          setError("Allowed IPs are required when IP restriction is enabled");
          return false;
        }
        break;
      case "advanced":
        // Advanced validation is optional
        break;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentTab()) return;

    setCompletedTabs(prev => new Set([...prev, activeTab]));

    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const handleTabClick = (tabId: string) => {
    // Allow going back to completed tabs or current tab
    if (completedTabs.has(tabId) || tabId === activeTab) {
      setActiveTab(tabId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!subject) {
      setError("No subject assigned to this teacher");
      return;
    }

    if (requirePassword && !password.trim()) {
      setError("Password is required when password protection is enabled");
      return;
    }

    if (restrictIp && !allowedIps.trim()) {
      setError("Allowed IPs are required when IP restriction is enabled");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmDialog(false);

    try {
      await startTransition(async () => {
        // Map frontend data to backend API format
        const testData = {
          title: title.trim(),
          description: description.trim() || 'Test description',
          instructions: instructions.trim() || undefined,
          subjectContentId: subject._id, // Use subject._id directly (already extracted ObjectId)
          teacherEmail: teacherEmail, // From teacher context
          type: testType,
          category: 'quiz', // Default category
          questions: questions, // Include questions in the update
          totalQuestions: testType === 'pdf' ? 1 : totalQuestions,
          duration: durationMinutes || 60,
          startTime: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          endTime: deadline ? new Date(deadline).toISOString() : undefined,
          moduleNumber: moduleId ? (moduleId.includes('_') ? parseInt(moduleId.split('_')[1]) :
                       (modules.find(m => m._id === moduleId)?.moduleNumber || parseInt(moduleId))) : undefined,
          moduleName: modules.find(m => (m._id || m.moduleNumber.toString()) === moduleId)?.moduleName ||
                     modules.find(m => (m._id || m.moduleNumber.toString()) === moduleId)?.title,
          allowMultipleAttempts: allowRetakes,
          maxAttempts: allowRetakes ? maxRetakes : 1,
          showResultsImmediately,
          showCorrectAnswers: true, // Default to true
          shuffleQuestions: randomizeQuestions,
          shuffleOptions: randomizeOptions,
          targetAudience: 'all', // Default to all
          totalMarks: testType === 'mcq' ? (totalQuestions * 4) : 100, // Estimate marks
          passingMarks: testType === 'mcq' ? Math.round((totalQuestions * 4) * (passingScore / 100)) :
                       Math.round(100 * (passingScore / 100))
        };

        console.log('Updating test with data:', testData);

        const result = await teacherAPI.tests.update(testId, testData);

        if (result.success) {
          // Go back to tests page
          onBack();
        } else {
          setError("Failed to update test");
        }
      });
    } catch (err) {
      setError("An error occurred while updating the test");
      console.error("Update test error:", err);
    }
  };

  // Question Management Functions
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      marks: 4,
      difficulty: 'medium'
    });
    setShowQuestionDialog(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText || '',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || 0,
      explanation: question.explanation || '',
      marks: question.marks || 4,
      difficulty: question.difficulty || 'medium'
    });
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = (questionIndex: number) => {
    setQuestions(prev => prev.filter((_, index) => index !== questionIndex));
  };

  const handleSaveQuestion = () => {
    if (!questionForm.questionText.trim()) {
      setError("Question text is required");
      return;
    }

    if (questionForm.options.filter(opt => opt.trim()).length < 2) {
      setError("At least 2 options are required");
      return;
    }

    const questionData = {
      questionText: questionForm.questionText.trim(),
      options: questionForm.options.filter(opt => opt.trim()),
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation.trim(),
      marks: questionForm.marks,
      difficulty: questionForm.difficulty,
      type: 'mcq'
    };

    if (editingQuestion !== null) {
      // Update existing question
      setQuestions(prev => prev.map((q, index) =>
        index === editingQuestion.index ? questionData : q
      ));
    } else {
      // Add new question
      setQuestions(prev => [...prev, questionData]);
    }

    setShowQuestionDialog(false);
    setError("");
  };

  const handleQuestionFormChange = (field: string, value: any) => {
    setQuestionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Test</h1>
            <p className="text-muted-foreground mt-2">Loading test data...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Test</h1>
          <p className="text-muted-foreground mt-2">
            Modify test settings and configuration
          </p>
        </div>
      </div>

      <form className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isCompleted = completedTabs.has(tab.id);
              const isActive = activeTab === tab.id;
              const isAccessible = isCompleted || isActive || index <= currentTabIndex;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center gap-2 ${
                    !isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${isCompleted ? 'bg-green-100 text-green-800' : ''} ${
                    isActive ? 'bg-blue-100 text-blue-800' : ''
                  }`}
                  onClick={() => isAccessible && handleTabClick(tab.id)}
                  disabled={!isAccessible}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject Info - Read Only */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Assigned Subject</span>
                  </div>
                  <p className="text-gray-800 font-semibold">{subject?.subjectName || 'No subject assigned'}</p>
                  <p className="text-sm text-gray-600 mt-1">{subject?.courseName || ''}</p>
                </div>

                <div className="space-y-2">
                  <Label>Module *</Label>
                  <Select value={moduleId} onValueChange={setModuleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.length > 0 ? (
                        modules.map((m: any) => {
                          const moduleValue = m._id || `module_${m.moduleNumber}`;
                          return (
                            <SelectItem key={moduleValue} value={moduleValue}>
                              {m.moduleName || m.title} (Module {m.moduleNumber})
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="no_modules" disabled>No modules available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter test title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the test"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Test Type</Label>
                    <Select value={testType} onValueChange={(value: "mcq" | "pdf" | "mixed") => setTestType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">MCQ Test</SelectItem>
                        <SelectItem value="pdf">PDF Test</SelectItem>
                        <SelectItem value="mixed">Mixed Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {testType !== 'pdf' && (
                    <div className="space-y-2">
                      <Label>Total Questions *</Label>
                      <Input
                        type="number"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 1)}
                        min="1"
                        required
                      />
                      <p className="text-xs text-gray-500">Number of questions this test should contain</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Passing Score (%)</Label>
                    <Input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(parseInt(e.target.value) || 60)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Test Questions
                    </CardTitle>
                    <CardDescription>
                      Add, edit, and manage questions for this test
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddQuestion} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No questions added yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Add questions to make this test functional for students
                    </p>
                    <Button onClick={handleAddQuestion} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  Q{index + 1}
                                </Badge>
                                <Badge
                                  variant={question.difficulty === 'easy' ? 'secondary' :
                                          question.difficulty === 'medium' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {question.difficulty}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {question.marks} marks
                                </span>
                              </div>
                              <p className="font-medium text-sm">{question.questionText}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditQuestion({ ...question, index })}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteQuestion(index)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {question.options.map((option: string, optIndex: number) => (
                              <div
                                key={optIndex}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  optIndex === question.correctAnswer
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  optIndex === question.correctAnswer
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-300'
                                }`}>
                                  {optIndex === question.correctAnswer && (
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span className={`text-sm ${
                                  optIndex === question.correctAnswer ? 'font-medium text-green-800' : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-xs font-medium text-blue-800 mb-1">Explanation:</p>
                              <p className="text-sm text-blue-700">{question.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    <div className="flex justify-center pt-4">
                      <Button onClick={handleAddQuestion} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Question
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduling & Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Date & Time
                    </Label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Leave empty for immediate availability</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Deadline
                    </Label>
                    <Input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Optional submission deadline</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked === true)}
                      />
                      <Label htmlFor="recurring" className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Recurring Test
                      </Label>
                    </div>

                  {isRecurring && (
                    <div className="ml-6 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select value={recurringType} onValueChange={(value: "daily" | "weekly" | "monthly") => setRecurringType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Number of Occurrences</Label>
                        <Input
                          type="number"
                          value={recurringCount}
                          onChange={(e) => setRecurringCount(parseInt(e.target.value) || 4)}
                          min="1"
                          max="52"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Test Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {testType === 'mcq' && (
                  <>
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-900">Question Behavior</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="randomize-questions"
                            checked={randomizeQuestions}
                            onCheckedChange={(checked) => setRandomizeQuestions(checked === true)}
                          />
                          <Label htmlFor="randomize-questions">Randomize question order</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="randomize-options"
                            checked={randomizeOptions}
                            onCheckedChange={(checked) => setRandomizeOptions(checked === true)}
                          />
                          <Label htmlFor="randomize-options">Randomize answer options</Label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-900">Timing</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Time per question (seconds)</Label>
                          <Input
                            type="number"
                            value={timePerQuestion}
                            onChange={(e) => setTimePerQuestion(parseInt(e.target.value) || 0)}
                            min="0"
                            placeholder="0 = no limit"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Checkbox
                            id="allow-calculator"
                            checked={allowCalculator}
                            onCheckedChange={(checked) => setAllowCalculator(checked === true)}
                          />
                          <Label htmlFor="allow-calculator" className="flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Allow calculator
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-900">Grading</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="partial-credit"
                          checked={partialCredit}
                          onCheckedChange={(checked) => setPartialCredit(checked === true)}
                        />
                        <Label htmlFor="partial-credit">Enable partial credit for multiple correct answers</Label>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900">Results & Retakes</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-results"
                        checked={showResultsImmediately}
                        onCheckedChange={(checked) => setShowResultsImmediately(checked === true)}
                      />
                      <Label htmlFor="show-results" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Show results immediately after submission
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow-retakes"
                        checked={allowRetakes}
                        onCheckedChange={(checked) => setAllowRetakes(checked === true)}
                      />
                      <Label htmlFor="allow-retakes">Allow retakes</Label>
                    </div>
                  </div>

                  {allowRetakes && (
                    <div className="ml-6 space-y-2">
                      <Label>Maximum retakes</Label>
                      <Input
                        type="number"
                        value={maxRetakes}
                        onChange={(e) => setMaxRetakes(parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="require-password"
                      checked={requirePassword}
                      onCheckedChange={(checked) => setRequirePassword(checked === true)}
                    />
                    <Label htmlFor="require-password" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Require password to access test
                    </Label>
                  </div>

                  {requirePassword && (
                    <div className="ml-6 space-y-2">
                      <Label>Test Password</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter test password"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restrict-ip"
                      checked={restrictIp}
                      onCheckedChange={(checked) => setRestrictIp(checked === true)}
                    />
                    <Label htmlFor="restrict-ip" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Restrict access by IP address
                    </Label>
                  </div>

                  {restrictIp && (
                    <div className="ml-6 space-y-2">
                      <Label>Allowed IP Addresses</Label>
                      <Textarea
                        value={allowedIps}
                        onChange={(e) => setAllowedIps(e.target.value)}
                        placeholder="Enter IP addresses (one per line or comma-separated)"
                        className="min-h-[60px]"
                      />
                      <p className="text-xs text-gray-500">Example: 192.168.1.1, 10.0.0.1</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify-students"
                      checked={notifyStudents}
                      onCheckedChange={(checked) => setNotifyStudents(checked === true)}
                    />
                    <Label htmlFor="notify-students" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notify students when test is available
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-reminders"
                      checked={sendReminders}
                      onCheckedChange={(checked) => setSendReminders(checked === true)}
                    />
                    <Label htmlFor="send-reminders" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Send reminder notifications
                    </Label>
                  </div>

                  {sendReminders && (
                    <div className="ml-6 space-y-2">
                      <Label>Reminder timing (hours before deadline)</Label>
                      <Input
                        type="number"
                        value={reminderHours}
                        onChange={(e) => setReminderHours(parseInt(e.target.value) || 24)}
                        min="1"
                        max="168"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Special Instructions</Label>
                    <Textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Additional instructions for students"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Comma-separated tags (e.g., math, algebra, quiz)"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-draft"
                      checked={isDraft}
                      onCheckedChange={(checked) => setIsDraft(checked === true)}
                    />
                    <Label htmlFor="is-draft">Save as draft (not visible to students)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="flex gap-4">
            {currentTabIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}

            {currentTabIndex < tabs.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    disabled={isPending}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Test
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Test Update</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to update this test? Changes will be applied immediately.
                      <br /><br />
                      <strong>Test Details:</strong><br />
                      Title: {title}<br />
                      Type: {testType.toUpperCase()}<br />
                      Duration: {durationMinutes} minutes<br />
                      Subject: {subject?.subjectName}<br />
                      {moduleId && `Module: ${modules.find(m => (m._id || m.moduleNumber.toString()) === moduleId)?.moduleName || modules.find(m => (m._id || m.moduleNumber.toString()) === moduleId)?.title}`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmUpdate} className="bg-green-600 hover:bg-green-700">
                      {isPending ? "Updating..." : "Update Test"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </form>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={questionForm.questionText}
                onChange={(e) => handleQuestionFormChange('questionText', e.target.value)}
                placeholder="Enter your question here..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Answer Options *</Label>
              {questionForm.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={questionForm.correctAnswer === index}
                    onChange={() => handleQuestionFormChange('correctAnswer', index)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  {questionForm.options.filter(opt => opt.trim()).length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuestionForm(prev => ({
                          ...prev,
                          options: prev.options.filter((_, i) => i !== index),
                          correctAnswer: prev.correctAnswer >= index && prev.correctAnswer > 0 ? prev.correctAnswer - 1 : prev.correctAnswer
                        }));
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {questionForm.options.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuestionForm(prev => ({
                      ...prev,
                      options: [...prev.options, '']
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={questionForm.explanation}
                onChange={(e) => handleQuestionFormChange('explanation', e.target.value)}
                placeholder="Explain why this answer is correct..."
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={questionForm.marks}
                  onChange={(e) => handleQuestionFormChange('marks', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={questionForm.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => handleQuestionFormChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQuestionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveQuestion}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}