import { ResourcesClient } from "./resources-client";

async function getData() {
  // Mock data for frontend development
  const now = Date.now();
  
  return {
    resources: [
      {
        _id: 'r1',
        title: 'Quadratic Equations Formula Sheet',
        description: 'Complete formula reference for solving quadratic equations',
        type: 'pdf',
        fileUrl: '/resources/quadratic-formulas.pdf',
        fileSize: '2.5 MB',
        chapter: 'Quadratic Equations',
        topic: 'Formula Reference',
        uploadedAt: new Date(now - 86400000).toISOString(),
        sharedWith: 'all',
        viewCount: 12,
        downloadCount: 8
      },
      {
        _id: 'r2',
        title: 'Calculus Basics Video Lecture',
        description: 'Introduction to derivatives and differentiation',
        type: 'video',
        fileUrl: '/resources/calculus-basics.mp4',
        fileSize: '145 MB',
        duration: '28:45',
        chapter: 'Calculus',
        topic: 'Differentiation Basics',
        uploadedAt: new Date(now - 172800000).toISOString(),
        sharedWith: 'team',
        teamName: 'Advanced Group',
        viewCount: 8,
        downloadCount: 3
      },
      {
        _id: 'r3',
        title: 'Trigonometry Practice Problems',
        description: '50 problems with solutions for exam preparation',
        type: 'pdf',
        fileUrl: '/resources/trig-practice.pdf',
        fileSize: '1.8 MB',
        chapter: 'Trigonometry',
        topic: 'Problem Solving',
        uploadedAt: new Date(now - 259200000).toISOString(),
        sharedWith: 'selected',
        studentCount: 2,
        viewCount: 15,
        downloadCount: 12
      },
      {
        _id: 'r4',
        title: 'Coordinate Geometry Notes',
        description: 'Comprehensive notes covering all topics',
        type: 'notes',
        fileUrl: '/resources/coordinate-notes.pdf',
        fileSize: '3.2 MB',
        chapter: 'Coordinate Geometry',
        topic: 'Complete Notes',
        uploadedAt: new Date(now - 345600000).toISOString(),
        sharedWith: 'all',
        viewCount: 20,
        downloadCount: 18
      },
      {
        _id: 'r5',
        title: 'Statistics Flowchart',
        description: 'Visual guide to statistical formulas',
        type: 'image',
        fileUrl: '/resources/stats-flowchart.png',
        fileSize: '890 KB',
        chapter: 'Statistics',
        topic: 'Visual Reference',
        uploadedAt: new Date(now - 432000000).toISOString(),
        sharedWith: 'all',
        viewCount: 10,
        downloadCount: 7
      }
    ],
    chapters: [
      'Quadratic Equations',
      'Calculus',
      'Trigonometry',
      'Coordinate Geometry',
      'Statistics'
    ],
    students: [
      { _id: 's1', name: 'Jane Smith', email: 'jane@example.com' },
      { _id: 's2', name: 'Mike Johnson', email: 'mike@example.com' },
      { _id: 's3', name: 'Emily Davis', email: 'emily@example.com' }
    ],
    teams: [
      { _id: 'team1', name: 'Full Class', studentCount: 3 },
      { _id: 'team2', name: 'Advanced Group', studentCount: 2 },
      { _id: 'team3', name: 'Support Group', studentCount: 1 }
    ],
    stats: {
      totalResources: 5,
      totalSize: '153.4 MB',
      totalViews: 65,
      totalDownloads: 48
    }
  };
}

export default async function ResourcesPage() {
  const data = await getData();
  
  return <ResourcesClient {...data} />;
}
