import { StudentsClient } from "./students-client";

async function getData() {
  // MOCK DATA FOR FRONTEND DEVELOPMENT
  return {
    students: [
      { 
        _id: 's1', 
        name: 'John Doe', 
        email: 'john@example.com', 
        enrolledCourses: ['Mathematics Grade 10', 'Physics Grade 11'],
        overallProgress: 78,
        attendanceRate: 92,
        assignmentsCompleted: 24,
        totalAssignments: 28,
        averageScore: 85,
        lastActive: new Date(Date.now() - 3600000).toISOString(),
        joinedDate: new Date(Date.now() - 7776000000).toISOString(),
        progress: { 
          '1': { 
            chaptersCompleted: 8, 
            totalChapters: 12,
            timeSpentMinutes: 420, 
            testsTaken: 4, 
            averageScore: 85,
            rank: 5
          },
          '2': {
            chaptersCompleted: 6,
            totalChapters: 10,
            timeSpentMinutes: 360,
            testsTaken: 3,
            averageScore: 88,
            rank: 3
          }
        }
      },
      { 
        _id: 's2', 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        enrolledCourses: ['Mathematics Grade 10', 'Grade 11 Study Package'],
        overallProgress: 92,
        attendanceRate: 98,
        assignmentsCompleted: 27,
        totalAssignments: 28,
        averageScore: 92,
        lastActive: new Date(Date.now() - 1800000).toISOString(),
        joinedDate: new Date(Date.now() - 7776000000).toISOString(),
        progress: { 
          '1': { 
            chaptersCompleted: 11, 
            totalChapters: 12,
            timeSpentMinutes: 520, 
            testsTaken: 4, 
            averageScore: 94,
            rank: 1
          }
        }
      },
      { 
        _id: 's3', 
        name: 'Mike Johnson', 
        email: 'mike@example.com', 
        enrolledCourses: ['Physics Grade 11', 'Chemistry Grade 12', 'Grade 11 Study Package'],
        overallProgress: 65,
        attendanceRate: 85,
        assignmentsCompleted: 19,
        totalAssignments: 28,
        averageScore: 75,
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        joinedDate: new Date(Date.now() - 7776000000).toISOString(),
        progress: { 
          '2': {
            chaptersCompleted: 5,
            totalChapters: 10,
            timeSpentMinutes: 280,
            testsTaken: 3,
            averageScore: 72,
            rank: 8
          }
        }
      },
      { 
        _id: 's4', 
        name: 'Sarah Williams', 
        email: 'sarah@example.com', 
        enrolledCourses: ['Chemistry Grade 12'],
        overallProgress: 88,
        attendanceRate: 95,
        assignmentsCompleted: 26,
        totalAssignments: 28,
        averageScore: 89,
        lastActive: new Date(Date.now() - 7200000).toISOString(),
        joinedDate: new Date(Date.now() - 7776000000).toISOString(),
        progress: {}
      },
      { 
        _id: 's5', 
        name: 'Emily Davis', 
        email: 'emily@example.com', 
        enrolledCourses: ['Grade 11 Study Package'],
        overallProgress: 95,
        attendanceRate: 100,
        assignmentsCompleted: 28,
        totalAssignments: 28,
        averageScore: 96,
        lastActive: new Date(Date.now() - 900000).toISOString(),
        joinedDate: new Date(Date.now() - 7776000000).toISOString(),
        progress: {}
      }
    ],
    attendance: [
      { date: new Date(Date.now() - 86400000).toISOString(), present: 42, absent: 3, total: 45 },
      { date: new Date(Date.now() - 172800000).toISOString(), present: 40, absent: 5, total: 45 },
      { date: new Date(Date.now() - 259200000).toISOString(), present: 43, absent: 2, total: 45 },
      { date: new Date(Date.now() - 345600000).toISOString(), present: 41, absent: 4, total: 45 },
      { date: new Date(Date.now() - 432000000).toISOString(), present: 44, absent: 1, total: 45 }
    ],
    stats: {
      totalStudents: 156,
      activeStudents: 142,
      avgAttendance: 91,
      avgProgress: 82
    },
    courses: [
      { _id: '1', title: 'Mathematics Grade 10' },
      { _id: '2', title: 'Physics Grade 11' },
      { _id: '3', title: 'Chemistry Grade 12' }
    ]
  };
}

export default async function StudentsPage() {
  const { students, attendance, stats, courses } = await getData();

  return (
    <StudentsClient 
      allStudents={students}
      attendance={attendance}
      allStats={stats}
      courses={courses}
    />
  );
}
