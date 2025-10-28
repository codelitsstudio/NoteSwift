"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import teacherAPI from "@/lib/api/teacher-api";
import { useTeacher } from "@/context/teacher-context";
import { Calendar, Clock, Settings, Users, Bell, Shield, BarChart3, Eye, RotateCcw, Calculator, Target } from "lucide-react";

export function CreateTestForm({ subject, modules }: { subject: any; modules: any[] }) {
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

  // Tab navigation
  const tabs = [
    { id: "basic", label: "Basic", icon: Settings },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "settings", label: "Settings", icon: Target },
    { id: "access", label: "Access", icon: Shield },
    { id: "advanced", label: "Advanced", icon: BarChart3 }
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  const validateCurrentTab = () => {
    switch (activeTab) {
      case "basic":
        if (!title.trim()) {
          setError("Test title is required");
          return false;
        }
        if (!subject) {
          setError("No subject assigned to this teacher");
          return false;
        }
        if (!moduleId) {
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

  // All modules belong to the teacher's assigned subject


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

  const handleConfirmCreate = async () => {
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
          questions: [], // Empty for now, will be added later
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

        console.log('Creating test with data:', testData);

        const result = await teacherAPI.tests.create(testData);

        if (result.success) {
          // Redirect to add questions page
          router.push('/dashboard/tests/add-questions');
        } else {
          setError("Failed to create test");
        }
      });
    } catch (err) {
      setError("An error occurred while creating the test");
      console.error("Create test error:", err);
    }
  };

  return (
    <form className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
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
                      modules.map((m: any) => (
                        <SelectItem key={m._id || m.moduleNumber} value={m._id || m.moduleNumber.toString()}>
                          {m.moduleName || m.title} (Module {m.moduleNumber})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No modules available</SelectItem>
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

        {/* Schedule Tab */}
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
            onClick={() => {
              // Reset form logic here
              setTitle("");
              setDescription("");
              setScheduledAt("");
              setDeadline("");
              setDurationMinutes(60);
              setTestType("mcq");
              setDifficulty("medium");
              setModuleId("");
              setTotalQuestions(10);
              setPassingScore(60);
              setRandomizeQuestions(true);
              setRandomizeOptions(true);
              setShowResultsImmediately(false);
              setAllowRetakes(false);
              setMaxRetakes(1);
              setTimePerQuestion(0);
              setAllowCalculator(false);
              setPartialCredit(false);
              setRequirePassword(false);
              setPassword("");
              setRestrictIp(false);
              setAllowedIps("");
              setNotifyStudents(true);
              setSendReminders(true);
              setReminderHours(24);
              setInstructions("");
              setTags("");
              setIsDraft(false);
              setIsRecurring(false);
              setRecurringType("weekly");
              setRecurringCount(4);
              setActiveTab("basic");
              setCompletedTabs(new Set());
              setError("");
            }}
          >
            Reset Form
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
                  Create Test
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Test Creation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to create this test? You can add questions to it after creation.
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
                  <AlertDialogAction onClick={handleConfirmCreate} className="bg-green-600 hover:bg-green-700">
                    {isPending ? "Creating..." : "Create Test"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </form>
  );
}
