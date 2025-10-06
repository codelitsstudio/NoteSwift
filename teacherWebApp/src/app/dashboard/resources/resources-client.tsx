"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Video, Image, Upload, Download, Eye, Trash2, 
  Filter, Search, Users, FolderOpen, Calendar, File
} from "lucide-react";
import { useState, useMemo } from "react";

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'notes' | 'image' | 'other';
  fileUrl: string;
  fileSize: string;
  duration?: string;
  chapter: string;
  topic: string;
  uploadedAt: string;
  sharedWith: 'all' | 'team' | 'selected';
  teamName?: string;
  studentCount?: number;
  viewCount: number;
  downloadCount: number;
}

interface ResourcesClientProps {
  resources: Resource[];
  chapters: string[];
  students: Array<{ _id: string; name: string; email: string }>;
  teams: Array<{ _id: string; name: string; studentCount: number }>;
  stats: {
    totalResources: number;
    totalSize: string;
    totalViews: number;
    totalDownloads: number;
  };
}

export function ResourcesClient({ resources: initialResources, chapters, students, teams, stats }: ResourcesClientProps) {
  const [resources, setResources] = useState(initialResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterChapter, setFilterChapter] = useState<string>('all');
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadType, setUploadType] = useState<string>('pdf');
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadTopic, setUploadTopic] = useState('');
  const [shareWith, setShareWith] = useState<'all' | 'team' | 'selected'>('all');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || resource.type === filterType;
      const matchesChapter = filterChapter === 'all' || resource.chapter === filterChapter;
      
      return matchesSearch && matchesType && matchesChapter;
    });
  }, [resources, searchQuery, filterType, filterChapter]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'notes':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-600" />;
      case 'image':
        return <Image className="h-5 w-5 text-blue-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getResourceColor = (type: string) => {
    // All cards have gray border by default, blue on hover
    return 'border-gray-200 hover:border-blue-500 transition-colors';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!uploadTitle || !uploadChapter || !uploadTopic || !uploadedFile) {
      alert('Please fill all required fields and select a file');
      return;
    }

    const newResource: Resource = {
      _id: `r${resources.length + 1}`,
      title: uploadTitle,
      description: uploadDescription,
      type: uploadType as any,
      fileUrl: URL.createObjectURL(uploadedFile),
      fileSize: `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      chapter: uploadChapter,
      topic: uploadTopic,
      uploadedAt: new Date().toISOString(),
      sharedWith: shareWith,
      teamName: shareWith === 'team' ? teams.find(t => t._id === selectedTeam)?.name : undefined,
      studentCount: shareWith === 'selected' ? selectedStudents.length : undefined,
      viewCount: 0,
      downloadCount: 0
    };

    setResources([newResource, ...resources]);
    
    // Reset form
    setUploadTitle('');
    setUploadDescription('');
    setUploadType('pdf');
    setUploadChapter('');
    setUploadTopic('');
    setShareWith('all');
    setSelectedTeam('');
    setSelectedStudents([]);
    setUploadedFile(null);
    
    alert('Resource uploaded successfully!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      setResources(resources.filter(r => r._id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Resource Library</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage study materials for your Grade 11 Mathematics students
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-blue-600" />
              {stats.totalResources}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Files uploaded</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6 text-purple-600" />
              {stats.totalSize}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Total file size</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/60 border-green-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6 text-green-600" />
              {stats.totalViews}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Student views</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Download className="h-6 w-6 text-blue-600" />
              {stats.totalDownloads}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Total downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Resources & Materials
          </CardTitle>
          <CardDescription>
            Upload study materials and manage resource distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Resources ({filteredResources.length})</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            {/* All Resources Tab */}
            <TabsContent value="all" className="space-y-4 mt-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search resources..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="border rounded-md px-3 py-2 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDFs</option>
                  <option value="video">Videos</option>
                  <option value="notes">Notes</option>
                  <option value="image">Images</option>
                </select>
                <select 
                  className="border rounded-md px-3 py-2 text-sm"
                  value={filterChapter}
                  onChange={(e) => setFilterChapter(e.target.value)}
                >
                  <option value="all">All Chapters</option>
                  {chapters.map(chapter => (
                    <option key={chapter} value={chapter}>{chapter}</option>
                  ))}
                </select>
              </div>

              {/* Resources List */}
              <div className="space-y-3">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <Card key={resource._id} className={`${getResourceColor(resource.type)} border-2`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-base truncate">{resource.title}</h3>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {resource.type.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FolderOpen className="h-3 w-3" />
                                  {resource.chapter} • {resource.topic}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(resource.uploadedAt).toLocaleDateString()}
                                </span>
                                <span>{resource.fileSize}</span>
                                {resource.duration && <span>⏱️ {resource.duration}</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {resource.sharedWith === 'all' && `All Students (3)`}
                                  {resource.sharedWith === 'team' && `${resource.teamName}`}
                                  {resource.sharedWith === 'selected' && `${resource.studentCount} Selected`}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> {resource.viewCount}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Download className="h-3 w-3" /> {resource.downloadCount}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(resource._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No resources found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resource Details</CardTitle>
                      <CardDescription>Enter information about the resource</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Title *</label>
                        <Input 
                          placeholder="e.g., Quadratic Equations Formula Sheet"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea 
                          placeholder="Brief description of the resource..."
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Resource Type *</label>
                          <select 
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={uploadType}
                            onChange={(e) => setUploadType(e.target.value)}
                          >
                            <option value="pdf">PDF Document</option>
                            <option value="video">Video</option>
                            <option value="notes">Notes</option>
                            <option value="image">Image/Diagram</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Chapter *</label>
                          <select 
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={uploadChapter}
                            onChange={(e) => setUploadChapter(e.target.value)}
                          >
                            <option value="">Select chapter</option>
                            {chapters.map(chapter => (
                              <option key={chapter} value={chapter}>{chapter}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Topic/Subtopic *</label>
                        <Input 
                          placeholder="e.g., Formula Reference, Practice Problems"
                          value={uploadTopic}
                          onChange={(e) => setUploadTopic(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Upload File *</label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <input 
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                              <span>Choose File</span>
                            </Button>
                          </label>
                          {uploadedFile && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {uploadedFile.name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Supported: PDF, DOC, JPG, PNG, MP4, MOV (Max 500MB)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Share With Students</CardTitle>
                      <CardDescription>Select who can access this resource</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Share Options */}
                      <div className="space-y-2">
                        <div 
                          className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                          onClick={() => setShareWith('all')}
                        >
                          <Checkbox checked={shareWith === 'all'} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">All Students</p>
                            <p className="text-xs text-muted-foreground">Share with entire class (3 students)</p>
                          </div>
                        </div>

                        <div 
                          className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                          onClick={() => setShareWith('team')}
                        >
                          <Checkbox checked={shareWith === 'team'} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Specific Team</p>
                            <p className="text-xs text-muted-foreground">Share with a student team</p>
                          </div>
                        </div>

                        {shareWith === 'team' && (
                          <div className="ml-6 space-y-2">
                            {teams.map(team => (
                              <div 
                                key={team._id}
                                className="flex items-center gap-2 p-2 border rounded hover:bg-muted cursor-pointer"
                                onClick={() => setSelectedTeam(team._id)}
                              >
                                <Checkbox checked={selectedTeam === team._id} />
                                <span className="text-sm">{team.name}</span>
                                <Badge variant="secondary" className="text-xs ml-auto">
                                  {team.studentCount}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        <div 
                          className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                          onClick={() => setShareWith('selected')}
                        >
                          <Checkbox checked={shareWith === 'selected'} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Select Individual Students</p>
                            <p className="text-xs text-muted-foreground">Choose specific students</p>
                          </div>
                        </div>

                        {shareWith === 'selected' && (
                          <div className="ml-6 space-y-2">
                            {students.map(student => (
                              <div 
                                key={student._id}
                                className="flex items-center gap-2 p-2 border rounded hover:bg-muted cursor-pointer"
                                onClick={() => {
                                  if (selectedStudents.includes(student._id)) {
                                    setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                                  } else {
                                    setSelectedStudents([...selectedStudents, student._id]);
                                  }
                                }}
                              >
                                <Checkbox checked={selectedStudents.includes(student._id)} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Upload Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Title</label>
                        <p className="text-sm font-medium">{uploadTitle || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Type</label>
                        <p className="text-sm font-medium">{uploadType.toUpperCase()}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Chapter</label>
                        <p className="text-sm font-medium">{uploadChapter || 'Not selected'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Topic</label>
                        <p className="text-sm font-medium">{uploadTopic || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">File</label>
                        <p className="text-sm font-medium">
                          {uploadedFile ? uploadedFile.name : 'No file selected'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Share With</label>
                        <p className="text-sm font-medium">
                          {shareWith === 'all' && 'All Students (3)'}
                          {shareWith === 'team' && (selectedTeam ? teams.find(t => t._id === selectedTeam)?.name : 'Select team')}
                          {shareWith === 'selected' && `${selectedStudents.length} Selected`}
                        </p>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleUpload}
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Resource
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-900">📚 Quick Tips</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• Keep file sizes under 500MB</li>
                          <li>• Use descriptive titles</li>
                          <li>• Organize by chapters & topics</li>
                          <li>• Students get instant notifications</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
