"use client";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addQuestion, suggestQuestions, arrangeOptions, generateWrongOptions, publishTest } from "@/app/teacher-actions";
import teacherAPI from "@/lib/api/teacher-api";
import { LatexPreview } from "@/components/latex-preview";
import { Upload, Plus, Trash2, FileText, CheckCircle, X, Sparkles, Brain, Shuffle, Loader2, ArrowRight } from "lucide-react";

interface MCQQuestion {
  id: string;
  text: string;
  options: { key: string; text: string; isCorrect: boolean }[];
  points: number;
  difficulty: string;
  topic: string;
  usesLatex: boolean;
}

interface PDFTest {
  title: string;
  description: string;
  instructions: string;
  file: File | null;
  duration: number;
  totalMarks: number;
}

interface MixedTest {
  title: string;
  description: string;
  instructions: string;
  file: File | null;
  mcqQuestions: MCQQuestion[];
  duration: number;
  totalMarks: number;
}

export function AddQuestionForm({ tests, teacherEmail, onRefreshTests }: { tests: any[], teacherEmail: string, onRefreshTests?: () => void }) {
  const [testId, setTestId] = useState<string>(tests[0]?._id || "");
  const [activeTab, setActiveTab] = useState<"mcq" | "pdf" | "mixed">("mcq");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  // AI Mode States
  const [aiMode, setAiMode] = useState<'none' | 'arrange' | 'generate'>('none');
  const [aiLoading, setAiLoading] = useState<{ arrange: boolean; generate: boolean }>({
    arrange: false,
    generate: false
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);

  // MCQ State
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([
    {
      id: '1',
      text: '',
      options: [
        { key: 'A', text: '', isCorrect: false },
        { key: 'B', text: '', isCorrect: false },
        { key: 'C', text: '', isCorrect: false },
        { key: 'D', text: '', isCorrect: false }
      ],
      points: 1,
      difficulty: 'medium',
      topic: '',
      usesLatex: false
    }
  ]);

  // PDF State
  const [pdfTest, setPdfTest] = useState<PDFTest>({
    title: '',
    description: '',
    instructions: '',
    file: null,
    duration: 60,
    totalMarks: 100
  });

  // Mixed State
  const [mixedTest, setMixedTest] = useState<MixedTest>({
    title: '',
    description: '',
    instructions: '',
    file: null,
    mcqQuestions: [
      {
        id: '1',
        text: '',
        options: [
          { key: 'A', text: '', isCorrect: false },
          { key: 'B', text: '', isCorrect: false },
          { key: 'C', text: '', isCorrect: false },
          { key: 'D', text: '', isCorrect: false }
        ],
        points: 1,
        difficulty: 'medium',
        topic: '',
        usesLatex: false
      }
    ],
    duration: 90,
    totalMarks: 100
  });

  const selectedTest = tests.find(t => t._id === testId);
  const testType = selectedTest?.type || 'mcq';
  const totalQuestions = selectedTest?.totalQuestions || 0;
  const backendCurrentQuestions = selectedTest?.questions?.length || 0;

  // Filter available tests (exclude published/active tests)
  const availableTests = tests.filter(t => t.status !== 'active' && t.status !== 'published');

  // Reset testId if currently selected test is not available
  useEffect(() => {
    if (testId && !availableTests.find(t => t._id === testId)) {
      // Select the first available test, or empty string if none available
      setTestId(availableTests[0]?._id || "");
    }
  }, [tests, testId, availableTests]);

  // Calculate current questions based on form state
  const getCurrentQuestionsFromForm = () => {
    if (testType === 'mcq') {
      return mcqQuestions.filter(q => 
        q.text.trim() && 
        q.options.every(opt => opt.text.trim()) && 
        q.options.some(opt => opt.isCorrect)
      ).length;
    } else if (testType === 'pdf') {
      return pdfTest.file && pdfTest.title.trim() ? 1 : 0;
    } else if (testType === 'mixed') {
      return mixedTest.mcqQuestions.filter(q => 
        q.text.trim() && 
        q.options.every(opt => opt.text.trim()) && 
        q.options.some(opt => opt.isCorrect)
      ).length;
    }
    return 0;
  };

  const currentQuestions = backendCurrentQuestions + getCurrentQuestionsFromForm();
  const canAddMoreQuestions = testType !== 'pdf' && !totalQuestions || currentQuestions < totalQuestions;
  const isTestComplete = testType === 'pdf' ? (pdfTest.file && pdfTest.title.trim()) : (totalQuestions > 0 ? currentQuestions >= totalQuestions : currentQuestions > 0);

  // MCQ Functions
  const addMcqQuestion = () => {
    const newQuestion: MCQQuestion = {
      id: Date.now().toString(),
      text: '',
      options: [
        { key: 'A', text: '', isCorrect: false },
        { key: 'B', text: '', isCorrect: false },
        { key: 'C', text: '', isCorrect: false },
        { key: 'D', text: '', isCorrect: false }
      ],
      points: 1,
      difficulty: 'medium',
      topic: '',
      usesLatex: false
    };
    setMcqQuestions([...mcqQuestions, newQuestion]);
  };

  const updateMcqQuestion = (index: number, field: keyof MCQQuestion, value: any) => {
    const updated = [...mcqQuestions];
    if (field === 'options') {
      updated[index].options = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setMcqQuestions(updated);
  };

  const removeMcqQuestion = (index: number) => {
    setMcqQuestions(mcqQuestions.filter((_, i) => i !== index));
  };

  // AI Functions for MCQ
  const handleArrangeOptions = async (questionIndex: number) => {
    setAiLoading(prev => ({ ...prev, arrange: true }));
    setCurrentQuestionIndex(questionIndex);
    setAiMode('arrange');

    const question = mcqQuestions[questionIndex];
    const correctOption = question.options.find(opt => opt.isCorrect);
    const wrongOptions = question.options.filter(opt => !opt.isCorrect && opt.text.trim());

    if (!correctOption?.text.trim()) {
      setError("Please mark the correct answer first");
      setAiLoading(prev => ({ ...prev, arrange: false }));
      return;
    }

    if (wrongOptions.length === 0) {
      setError("Please add at least one wrong option");
      setAiLoading(prev => ({ ...prev, arrange: false }));
      return;
    }

    try {
      const result = await arrangeOptions({
        correctAnswer: correctOption.text,
        wrongAnswers: wrongOptions.map(opt => opt.text)
      });

      if (result.success) {
        updateMcqQuestion(questionIndex, 'options', result.options);
        setAiMode('none');
        setCurrentQuestionIndex(null);
      } else {
        setError("Failed to arrange options");
      }
    } catch (err) {
      setError("AI service unavailable");
    } finally {
      setAiLoading(prev => ({ ...prev, arrange: false }));
    }
  };

  const handleGenerateWrongOptions = async (questionIndex: number) => {
    setAiLoading(prev => ({ ...prev, generate: true }));
    setCurrentQuestionIndex(questionIndex);
    setAiMode('generate');

    const question = mcqQuestions[questionIndex];

    if (!question.text.trim()) {
      setError("Please enter a question first");
      setAiLoading(prev => ({ ...prev, generate: false }));
      return;
    }

    const correctOption = question.options.find(opt => opt.isCorrect);
    if (!correctOption?.text.trim()) {
      setError("Please enter the correct answer first");
      setAiLoading(prev => ({ ...prev, generate: false }));
      return;
    }

    try {
      const result = await generateWrongOptions({
        question: question.text,
        correctAnswer: correctOption.text,
        count: 3
      });

      if (result.success && result.wrongOptions) {
        const newOptions = [...question.options];
        const correctIndex = question.options.findIndex(opt => opt.isCorrect);

        // Place wrong options in the non-correct slots
        let wrongOptionIndex = 0;
        for (let i = 0; i < newOptions.length; i++) {
          if (i !== correctIndex && wrongOptionIndex < result.wrongOptions.length) {
            newOptions[i].text = result.wrongOptions[wrongOptionIndex];
            newOptions[i].isCorrect = false;
            wrongOptionIndex++;
          }
        }

        updateMcqQuestion(questionIndex, 'options', newOptions);
        setAiMode('none');
        setCurrentQuestionIndex(null);
      } else {
        setError("Failed to generate wrong options");
      }
    } catch (err) {
      setError("AI service unavailable");
    } finally {
      setAiLoading(prev => ({ ...prev, generate: false }));
    }
  };

  const handleMcqSubmit = async () => {
    setError("");
    try {
      // Validate all questions in the form
      const completeQuestions = mcqQuestions.filter(q => 
        q.text.trim() && 
        q.options.every(opt => opt.text.trim()) && 
        q.options.some(opt => opt.isCorrect)
      );

      if (completeQuestions.length === 0) {
        setError("Please complete at least one question with text and all 4 options");
        return;
      }

      // Check if we have the right number of questions
      if (totalQuestions > 0 && completeQuestions.length !== totalQuestions) {
        setError(`Test requires exactly ${totalQuestions} questions. You have ${completeQuestions.length} complete questions.`);
        return;
      }

      startTransition(async () => {
        // Add all complete questions at once
        for (const question of completeQuestions) {
          await addQuestion({
            testId,
            type: 'mcq',
            text: question.text,
            options: question.options,
            correctAnswer: question.options.find(opt => opt.isCorrect)?.key,
            points: question.points,
            difficulty: question.difficulty as any,
            usesLatex: question.usesLatex
          });
        }

        // Reset form
        setMcqQuestions([{
          id: '1',
          text: '',
          options: [
            { key: 'A', text: '', isCorrect: false },
            { key: 'B', text: '', isCorrect: false },
            { key: 'C', text: '', isCorrect: false },
            { key: 'D', text: '', isCorrect: false }
          ],
          points: 1,
          difficulty: 'medium',
          topic: '',
          usesLatex: false
        }]);

        // Publish the test
        await publishTest({
          testId,
          teacherEmail
        });

        // Refresh tests to update question count
        onRefreshTests?.();
      });
    } catch (err) {
      setError("Failed to add questions and publish test");
    }
  };

  // PDF Functions
  const handlePdfSubmit = async () => {
    setError("");
    if (!pdfTest.file) {
      setError("Please upload a PDF file");
      return;
    }
    if (!pdfTest.title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      startTransition(async () => {
        try {
          // First upload the PDF to Firebase
          const uploadResult = await teacherAPI.tests.uploadPDF(testId, pdfTest.file!, teacherEmail);
          
          if (!uploadResult.success) {
            setError("Failed to upload PDF file");
            return;
          }

          // Update test with PDF details
          await teacherAPI.tests.update(testId, {
            pdfUrl: uploadResult.data.pdfUrl,
            pdfFileName: uploadResult.data.pdfFileName,
            totalMarks: pdfTest.totalMarks,
            duration: pdfTest.duration,
            instructions: pdfTest.instructions
          });

          // Create a single question entry with the PDF
          await addQuestion({
            testId,
            type: 'pdf',
            text: `${pdfTest.title}\n\n${pdfTest.description}\n\nInstructions: ${pdfTest.instructions}`,
            points: pdfTest.totalMarks,
            difficulty: 'medium',
            usesLatex: false
          });

          // Publish the test
          await publishTest({
            testId,
            teacherEmail
          });

          // Reset form
          setPdfTest({
            title: '',
            description: '',
            instructions: '',
            file: null,
            duration: 60,
            totalMarks: 100
          });

          // Refresh tests to update question count
          onRefreshTests?.();
        } catch (innerError) {
          console.error('PDF upload/publish error:', innerError);
          setError("Failed to create PDF test and publish");
        }
      });
    } catch (err) {
      setError("Failed to create PDF test and publish");
    }
  };

  // Mixed Functions
  const addMixedMcqQuestion = () => {
    const newQuestion: MCQQuestion = {
      id: Date.now().toString(),
      text: '',
      options: [
        { key: 'A', text: '', isCorrect: false },
        { key: 'B', text: '', isCorrect: false },
        { key: 'C', text: '', isCorrect: false },
        { key: 'D', text: '', isCorrect: false }
      ],
      points: 1,
      difficulty: 'medium',
      topic: '',
      usesLatex: false
    };
    setMixedTest({...mixedTest, mcqQuestions: [...mixedTest.mcqQuestions, newQuestion]});
  };

  const updateMixedMcqQuestion = (index: number, field: keyof MCQQuestion, value: any) => {
    const updated = [...mixedTest.mcqQuestions];
    if (field === 'options') {
      updated[index].options = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setMixedTest({...mixedTest, mcqQuestions: updated});
  };

  const removeMixedMcqQuestion = (index: number) => {
    setMixedTest({...mixedTest, mcqQuestions: mixedTest.mcqQuestions.filter((_, i) => i !== index)});
  };

  // AI Functions for Mixed Test MCQ
  const handleMixedArrangeOptions = async (questionIndex: number) => {
    const question = mixedTest.mcqQuestions[questionIndex];
    const correctOption = question.options.find(opt => opt.isCorrect);
    const wrongOptions = question.options.filter(opt => !opt.isCorrect && opt.text.trim());

    if (!correctOption?.text.trim()) {
      setError("Please set a correct answer first");
      return;
    }

    if (wrongOptions.length === 0) {
      setError("Please add at least one wrong option");
      return;
    }

    try {
      const result = await arrangeOptions({
        correctAnswer: correctOption.text,
        wrongAnswers: wrongOptions.map(opt => opt.text)
      });

      if (result.success) {
        updateMixedMcqQuestion(questionIndex, 'options', result.options);
      } else {
        setError("Failed to arrange options");
      }
    } catch (err) {
      setError("AI service unavailable");
    }
  };

  const handleMixedGenerateWrongOptions = async (questionIndex: number) => {
    const question = mixedTest.mcqQuestions[questionIndex];

    if (!question.text.trim()) {
      setError("Please enter a question first");
      return;
    }

    const correctOption = question.options.find(opt => opt.isCorrect);
    if (!correctOption?.text.trim()) {
      setError("Please set a correct answer first");
      return;
    }

    try {
      const result = await generateWrongOptions({
        question: question.text,
        correctAnswer: correctOption.text,
        count: 3
      });

      if (result.success && result.wrongOptions) {
        const newOptions = [...question.options];
        const correctIndex = question.options.findIndex(opt => opt.isCorrect);

        // Place wrong options in the non-correct slots
        let wrongOptionIndex = 0;
        for (let i = 0; i < newOptions.length; i++) {
          if (i !== correctIndex && wrongOptionIndex < result.wrongOptions.length) {
            newOptions[i].text = result.wrongOptions[wrongOptionIndex];
            newOptions[i].isCorrect = false;
            wrongOptionIndex++;
          }
        }

        updateMixedMcqQuestion(questionIndex, 'options', newOptions);
      } else {
        setError("Failed to generate wrong options");
      }
    } catch (err) {
      setError("AI service unavailable");
    }
  };

  const handleMixedSubmit = async () => {
    setError("");
    try {
      // Validate MCQ questions
      const completeQuestions = mixedTest.mcqQuestions.filter(q => 
        q.text.trim() && 
        q.options.every(opt => opt.text.trim()) && 
        q.options.some(opt => opt.isCorrect)
      );

      if (completeQuestions.length === 0) {
        setError("Please complete at least one MCQ question with text and all 4 options");
        return;
      }

      // Check if we have the right number of questions
      if (totalQuestions > 0 && completeQuestions.length !== totalQuestions) {
        setError(`Test requires exactly ${totalQuestions} questions. You have ${completeQuestions.length} complete questions.`);
        return;
      }

      startTransition(async () => {
        // Add all complete MCQ questions
        for (const question of completeQuestions) {
          await addQuestion({
            testId,
            type: 'mcq',
            text: question.text,
            options: question.options,
            correctAnswer: question.options.find(opt => opt.isCorrect)?.key,
            points: question.points,
            difficulty: question.difficulty as any,
            usesLatex: false
          });
        }

        // Reset MCQ form
        setMixedTest(prev => ({
          ...prev,
          mcqQuestions: [{
            id: '1',
            text: '',
            options: [
              { key: 'A', text: '', isCorrect: false },
              { key: 'B', text: '', isCorrect: false },
              { key: 'C', text: '', isCorrect: false },
              { key: 'D', text: '', isCorrect: false }
            ],
            points: 1,
            difficulty: 'medium',
            topic: '',
            usesLatex: false
          }]
        }));

        // Publish the test
        await publishTest({
          testId,
          teacherEmail
        });

        // Refresh tests to update question count
        onRefreshTests?.();
      });
    } catch (err) {
      setError("Failed to add questions and publish test");
    }
  };

  const handlePublishTest = async () => {
    setError("");
    try {
      startTransition(async () => {
        await publishTest({
          testId,
          teacherEmail
        });
        // Optionally redirect or show success message
      });
    } catch (err) {
      setError("Failed to publish test");
    }
  };

  if (!selectedTest) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Please select a test first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Total Questions Info Banner */}
      {selectedTest && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Test Requirements</span>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            {testType === 'pdf' ? (
              <>
                Upload a PDF file and provide test details to complete this PDF test.
                {pdfTest.file && pdfTest.title.trim() ? (
                  <span className="ml-1 text-green-600 font-medium">✓ PDF uploaded and details provided - ready to publish!</span>
                ) : (
                  <span className="ml-1">Please upload a PDF file and enter test details.</span>
                )}
              </>
            ) : totalQuestions > 0 ? (
              <>
                This test has <strong>{totalQuestions} questions</strong>. You must enter exactly this number of questions.
                {currentQuestions < totalQuestions && (
                  <span className="ml-1">Currently have <strong>{currentQuestions}</strong> - need <strong>{totalQuestions - currentQuestions} more</strong>.</span>
                )}
                {isTestComplete && (
                  <span className="ml-1 text-green-600 font-medium">✓ Ready to publish!</span>
                )}
              </>
            ) : (
              <>
                This test has no question limit. You currently have <strong>{currentQuestions} questions</strong> added.
                {currentQuestions > 0 && (
                  <span className="ml-1 text-green-600 font-medium">✓ Ready to publish!</span>
                )}
              </>
            )}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Test</Label>
          <Select value={testId} onValueChange={setTestId}>
            <SelectTrigger>
              <SelectValue placeholder="Select test" />
            </SelectTrigger>
            <SelectContent>
              {availableTests.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.title} ({t.type.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <div className="space-y-2">
            <Badge variant="outline" className="text-sm">
              Test Type: {testType.toUpperCase()}
            </Badge>
            {testType !== 'pdf' && totalQuestions > 0 && (
              <div className="text-sm text-gray-600">
                Questions: {currentQuestions} / {totalQuestions}
                {isTestComplete && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    ✓ Complete
                  </Badge>
                )}
              </div>
            )}
            {testType === 'pdf' && (
              <div className="text-sm text-gray-600">
                PDF: {pdfTest.file ? 'Uploaded' : 'Not uploaded'}
                {isTestComplete && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    ✓ Complete
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mcq" disabled={testType !== 'mcq' && testType !== 'mixed'}>
            MCQ Questions
          </TabsTrigger>
          <TabsTrigger value="pdf" disabled={testType !== 'pdf' && testType !== 'mixed'}>
            PDF Test
          </TabsTrigger>
          <TabsTrigger value="mixed" disabled={testType !== 'mixed'}>
            Mixed Test
          </TabsTrigger>
        </TabsList>

        {/* MCQ Tab */}
        <TabsContent value="mcq" className="space-y-6">
          {/* AI Features Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-gray-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-800">AI-Powered Question Creation</span>
              </div>
         
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Use AI to automatically arrange answer options or generate realistic wrong answers for your MCQ questions.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">MCQ Questions</CardTitle>
                <div className="flex gap-2">
                  {!isTestComplete && (
                    <Button 
                      onClick={addMcqQuestion} 
                      size="sm"
                      disabled={!canAddMoreQuestions}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  )}
                  {isTestComplete && (
                    <Button onClick={handleMcqSubmit} disabled={isPending} className="bg-green-600 hover:bg-green-700" size="sm">
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish Test
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {totalQuestions > 0 && !isTestComplete && (
                <div className="text-sm text-gray-600">
                  Add {totalQuestions - currentQuestions} more question{totalQuestions - currentQuestions !== 1 ? 's' : ''} to complete the test
                </div>
              )}
              {isTestComplete && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Test is complete! Click "Publish Test" to make it available to students.
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {mcqQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      {mcqQuestions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMcqQuestion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.text}
                        onChange={(e) => updateMcqQuestion(index, 'text', e.target.value)}
                        placeholder="Enter your question here..."
                        className="min-h-[80px]"
                      />
                      {question.usesLatex && <LatexPreview content={question.text} enabled={true} />}
                    </div>

                    {/* AI Feature Selection - Inline */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Options</Label>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            size="sm"
                            variant={aiMode === 'arrange' ? "default" : "outline"}
                            onClick={() => setAiMode(aiMode === 'arrange' ? 'none' : 'arrange')}
                            disabled={!question.text.trim()}
                            className={`flex items-center gap-2 ${aiMode === 'arrange' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'hover:bg-blue-50'}`}
                          >
                            <Shuffle className="h-3 w-3" />
                            AI Arrange
                            <Badge variant="secondary" className="text-xs ml-1">AI</Badge>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={aiMode === 'generate' ? "default" : "outline"}
                            onClick={() => setAiMode(aiMode === 'generate' ? 'none' : 'generate')}
                            disabled={!question.text.trim()}
                            className={`flex items-center gap-2 ${aiMode === 'generate' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'hover:bg-slate-50'}`}
                          >
                            <Brain className="h-3 w-3" />
                            AI Generate
                            <Badge variant="secondary" className="text-xs ml-1">AI</Badge>
                          </Button>
                        </div>
                      </div>

                      {/* AI Mode Descriptions */}
                      {aiMode === 'arrange' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Shuffle className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">AI Arrange Mode</span>
                          </div>
                          <p className="text-xs text-gray-700">
                            Enter your correct answer and wrong options below. Click "Arrange Options" to randomly shuffle them into A, B, C, D positions.
                          </p>
                        </div>
                      )}

                      {aiMode === 'generate' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-800">AI Generate Mode</span>
                          </div>
                          <p className="text-xs text-slate-700">
                            Enter your correct answer below. Click "Generate Wrong Options" to let AI create 3 realistic wrong answers.
                          </p>
                        </div>
                      )}

                      {/* Options Interface Based on AI Mode */}
                      {aiMode === 'arrange' && (
                        <div className="space-y-3">
                          {question.options.map((option, optIndex) => (
                            <div key={option.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 min-w-[80px]">
                                <span className="font-medium text-blue-600">{option.key}.</span>
                                <input
                                  type="radio"
                                  name={`arrange-correct-${question.id}`}
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    const newOptions = question.options.map((opt, i) => ({
                                      ...opt,
                                      isCorrect: i === optIndex
                                    }));
                                    updateMcqQuestion(index, 'options', newOptions);
                                  }}
                                  className="w-4 h-4 text-blue-600"
                                />
                                {option.isCorrect && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                    ✓ Correct
                                  </Badge>
                                )}
                              </div>
                              <Input
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optIndex].text = e.target.value;
                                  updateMcqQuestion(index, 'options', newOptions);
                                }}
                                placeholder={option.isCorrect ? "Enter the correct answer..." : `Wrong option ${option.key}...`}
                                className="flex-1 border-blue-200 focus:border-blue-300"
                              />
                            </div>
                          ))}
                          <div className="flex justify-end">
                            <Button
                              onClick={() => handleArrangeOptions(index)}
                              disabled={aiLoading.arrange || !question.options.some(opt => opt.isCorrect) || question.options.filter(opt => !opt.isCorrect && opt.text.trim()).length === 0}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {aiLoading.arrange ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Arranging Options...
                                </>
                              ) : (
                                <>
                                  <Shuffle className="h-4 w-4 mr-2" />
                                  Arrange Options
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {aiMode === 'generate' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">✓ Correct Answer</Badge>
                              <span className="text-xs text-gray-600">(Option A)</span>
                            </div>
                            <Input
                              value={question.options[0]?.text || ''}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[0].text = e.target.value;
                                newOptions[0].isCorrect = true; // Ensure A is marked as correct
                                // Clear other options to prepare for AI generation
                                for (let i = 1; i < newOptions.length; i++) {
                                  newOptions[i].isCorrect = false;
                                  newOptions[i].text = '';
                                }
                                updateMcqQuestion(index, 'options', newOptions);
                              }}
                              placeholder="Enter the correct answer..."
                              className="border-green-200 focus:border-green-300"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => handleGenerateWrongOptions(index)}
                              disabled={aiLoading.generate || !question.text.trim() || !question.options[0]?.text.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {aiLoading.generate ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Generating Options...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-4 w-4 mr-2" />
                                  Generate Wrong Options
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Manual Options (when no AI mode selected) */}
                      {aiMode === 'none' && (
                        <div className="space-y-3">
                          {question.options.map((option, optIndex) => (
                            <div key={option.key} className="flex items-center gap-3">
                              <div className="flex items-center gap-2 min-w-[60px]">
                                <span className="font-medium">{option.key}.</span>
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    const newOptions = question.options.map((opt, i) => ({
                                      ...opt,
                                      isCorrect: i === optIndex
                                    }));
                                    updateMcqQuestion(index, 'options', newOptions);
                                  }}
                                />
                                {option.isCorrect && (
                                  <span className="text-xs text-green-600 font-medium">✓ Correct</span>
                                )}
                              </div>
                              <Input
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optIndex].text = e.target.value;
                                  updateMcqQuestion(index, 'options', newOptions);
                                }}
                                placeholder={`Option ${option.key}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateMcqQuestion(index, 'points', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>Difficulty</Label>
                        <Select
                          value={question.difficulty}
                          onValueChange={(value) => updateMcqQuestion(index, 'difficulty', value)}
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
                      <div>
                        <Label>Topic</Label>
                        <Input
                          value={question.topic}
                          onChange={(e) => updateMcqQuestion(index, 'topic', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={question.usesLatex}
                            onChange={(e) => updateMcqQuestion(index, 'usesLatex', e.target.checked)}
                          />
                          <span className="text-sm">LaTeX</span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Tab */}
        <TabsContent value="pdf" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PDF Test Setup</CardTitle>
              {isTestComplete && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Test is complete! Click "Publish Test" to make it available to students.
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>PDF Title</Label>
                <Input
                  value={pdfTest.title}
                  onChange={(e) => setPdfTest({...pdfTest, title: e.target.value})}
                  placeholder="Enter PDF title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={pdfTest.description}
                  onChange={(e) => setPdfTest({...pdfTest, description: e.target.value})}
                  placeholder="Describe what students need to do"
                />
              </div>

              <div>
                <Label>Instructions for Students</Label>
                <Textarea
                  value={pdfTest.instructions}
                  onChange={(e) => setPdfTest({...pdfTest, instructions: e.target.value})}
                  placeholder="Specific instructions for completing the test"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Upload PDF File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {pdfTest.file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium">{pdfTest.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(pdfTest.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPdfTest({...pdfTest, file: null})}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload PDF file</p>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setPdfTest({...pdfTest, file});
                        }}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <Label htmlFor="pdf-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={pdfTest.duration}
                    onChange={(e) => setPdfTest({...pdfTest, duration: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Total Marks</Label>
                  <Input
                    type="number"
                    value={pdfTest.totalMarks}
                    onChange={(e) => setPdfTest({...pdfTest, totalMarks: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {/* Only show Publish button when test is complete, remove Add X question button at the bottom */}
                {isTestComplete && (
                  <Button onClick={handlePdfSubmit} disabled={isPending} className="bg-green-600 hover:bg-green-700">
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish Test
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mixed Tab */}
        <TabsContent value="mixed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mixed Test Setup</CardTitle>
              {totalQuestions > 0 && !isTestComplete && (
                <div className="text-sm text-gray-600">
                  Add {totalQuestions - currentQuestions} more question{totalQuestions - currentQuestions !== 1 ? 's' : ''} to complete the test
                </div>
              )}
              {isTestComplete && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Test is complete! Click "Publish Test" to make it available to students.
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PDF Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">PDF Component (Optional)</h3>
                <div>
                  <Label>Test Title</Label>
                  <Input
                    value={mixedTest.title}
                    onChange={(e) => setMixedTest({...mixedTest, title: e.target.value})}
                    placeholder="Enter test title"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={mixedTest.description}
                    onChange={(e) => setMixedTest({...mixedTest, description: e.target.value})}
                    placeholder="Describe the PDF component"
                  />
                </div>

                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    value={mixedTest.instructions}
                    onChange={(e) => setMixedTest({...mixedTest, instructions: e.target.value})}
                    placeholder="Instructions for the PDF part"
                  />
                </div>

                <div>
                  <Label>Upload PDF File (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {mixedTest.file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-6 w-6 text-red-500" />
                        <span className="text-sm">{mixedTest.file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMixedTest({...mixedTest, file: null})}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setMixedTest({...mixedTest, file});
                          }}
                          className="hidden"
                          id="mixed-pdf-upload"
                        />
                        <Label htmlFor="mixed-pdf-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>Choose PDF File</span>
                          </Button>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MCQ Section */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-gray-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-800 text-sm">AI-Powered MCQ Creation</span>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-gray-700 border-blue-200">
                      AI
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">MCQ Questions</h3>
                  <div className="flex gap-2">
                    {isTestComplete ? (
                      <Button onClick={handleMixedSubmit} disabled={isPending} className="bg-green-600 hover:bg-green-700" size="sm">
                        {isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Publish Test
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={addMixedMcqQuestion} size="sm" disabled={!canAddMoreQuestions}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add MCQ
                      </Button>
                    )}
                  </div>
                </div>

                {mixedTest.mcqQuestions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">MCQ {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMixedMcqQuestion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={question.text}
                        onChange={(e) => updateMixedMcqQuestion(index, 'text', e.target.value)}
                        placeholder="Question text..."
                        className="min-h-[60px]"
                      />

                      {/* AI Feature Selection for Mixed Test - Inline */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Options</Label>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              size="sm"
                              variant={aiMode === 'arrange' ? "default" : "outline"}
                              onClick={() => setAiMode(aiMode === 'arrange' ? 'none' : 'arrange')}
                              disabled={!question.text.trim()}
                              className={`flex items-center gap-2 ${aiMode === 'arrange' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'hover:bg-blue-50'}`}
                            >
                              <Shuffle className="h-3 w-3" />
                              AI Arrange
                              <Badge variant="secondary" className="text-xs ml-1">AI</Badge>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={aiMode === 'generate' ? "default" : "outline"}
                              onClick={() => setAiMode(aiMode === 'generate' ? 'none' : 'generate')}
                              disabled={!question.text.trim()}
                              className={`flex items-center gap-2 ${aiMode === 'generate' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'hover:bg-slate-50'}`}
                            >
                              <Brain className="h-3 w-3" />
                              AI Generate
                              <Badge variant="secondary" className="text-xs ml-1">AI</Badge>
                            </Button>
                          </div>
                        </div>

                        {/* AI Mode Descriptions */}
                        {aiMode === 'arrange' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Shuffle className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-800">AI Arrange Mode</span>
                            </div>
                            <p className="text-xs text-gray-700">
                              Enter your correct answer and wrong options below. Click "Arrange Options" to randomly shuffle them into A, B, C, D positions.
                            </p>
                          </div>
                        )}

                        {aiMode === 'generate' && (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-slate-600" />
                              <span className="text-sm font-medium text-slate-800">AI Generate Mode</span>
                            </div>
                            <p className="text-xs text-slate-700">
                              Enter your correct answer below. Click "Generate Wrong Options" to let AI create 3 realistic wrong answers.
                            </p>
                          </div>
                        )}

                        {/* Options Interface Based on AI Mode */}
                        {aiMode === 'arrange' && (
                          <div className="space-y-3">
                            {question.options.map((option, optIndex) => (
                              <div key={option.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 min-w-[80px]">
                                  <span className="font-medium text-blue-600">{option.key}.</span>
                                  <input
                                    type="radio"
                                    name={`mixed-arrange-correct-${question.id}`}
                                    checked={option.isCorrect}
                                    onChange={() => {
                                      const newOptions = question.options.map((opt, i) => ({
                                        ...opt,
                                        isCorrect: i === optIndex
                                      }));
                                      updateMixedMcqQuestion(index, 'options', newOptions);
                                    }}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  {option.isCorrect && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                      ✓ Correct
                                    </Badge>
                                  )}
                                </div>
                                <Input
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optIndex].text = e.target.value;
                                    updateMixedMcqQuestion(index, 'options', newOptions);
                                  }}
                                  placeholder={option.isCorrect ? "Enter the correct answer..." : `Wrong option ${option.key}...`}
                                  className="flex-1 border-blue-200 focus:border-blue-300"
                                />
                              </div>
                            ))}
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleMixedArrangeOptions(index)}
                                disabled={aiLoading.arrange || !question.options.some(opt => opt.isCorrect) || question.options.filter(opt => !opt.isCorrect && opt.text.trim()).length === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {aiLoading.arrange ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Arranging Options...
                                  </>
                                ) : (
                                  <>
                                    <Shuffle className="h-4 w-4 mr-2" />
                                    Arrange Options
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {aiMode === 'generate' && (
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">✓ Correct Answer</Badge>
                                <span className="text-xs text-gray-600">(Option A)</span>
                              </div>
                              <Input
                                value={question.options[0]?.text || ''}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[0].text = e.target.value;
                                  newOptions[0].isCorrect = true; // Ensure A is marked as correct
                                  // Clear other options to prepare for AI generation
                                  for (let i = 1; i < newOptions.length; i++) {
                                    newOptions[i].isCorrect = false;
                                    newOptions[i].text = '';
                                  }
                                  updateMixedMcqQuestion(index, 'options', newOptions);
                                }}
                                placeholder="Enter the correct answer..."
                                className="border-green-200 focus:border-green-300"
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleMixedGenerateWrongOptions(index)}
                                disabled={aiLoading.generate || !question.text.trim() || !question.options[0]?.text.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {aiLoading.generate ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating Options...
                                  </>
                                ) : (
                                  <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Generate Wrong Options
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Manual Options (when no AI mode selected) */}
                        {aiMode === 'none' && (
                          <div className="space-y-3">
                            {question.options.map((option, optIndex) => (
                              <div key={option.key} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`mixed-correct-${question.id}`}
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    const newOptions = question.options.map((opt, i) => ({
                                      ...opt,
                                      isCorrect: i === optIndex
                                    }));
                                    updateMixedMcqQuestion(index, 'options', newOptions);
                                  }}
                                />
                                <span className="min-w-[20px]">{option.key}.</span>
                                <Input
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optIndex].text = e.target.value;
                                    updateMixedMcqQuestion(index, 'options', newOptions);
                                  }}
                                  placeholder={`Option ${option.key}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateMixedMcqQuestion(index, 'points', parseInt(e.target.value))}
                          placeholder="Points"
                          className="w-20"
                        />
                        <Select
                          value={question.difficulty}
                          onValueChange={(value) => updateMixedMcqQuestion(index, 'difficulty', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={mixedTest.duration}
                    onChange={(e) => setMixedTest({...mixedTest, duration: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Total Marks</Label>
                  <Input
                    type="number"
                    value={mixedTest.totalMarks}
                    onChange={(e) => setMixedTest({...mixedTest, totalMarks: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {/* Only show Publish button when test is complete, remove Add X question button at the bottom */}
                {isTestComplete && (
                  <Button onClick={handleMixedSubmit} disabled={isPending} className="bg-green-600 hover:bg-green-700">
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish Test
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
