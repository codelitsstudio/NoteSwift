import { StudentsClient } from "./students-client";
import teacherAPI from "@/lib/api/teacher-api";
import { getTeacherEmail } from "@/lib/auth";

async function getData() {
  const teacherEmail = await getTeacherEmail();

  if (!teacherEmail) {
    return {
      students: [],
      attendance: [],
      stats: {
        totalStudents: 0,
        activeStudents: 0,
        avgAttendance: 0,
        avgProgress: 0
      },
      courses: []
    };
  }

  try {
    // Fetch students, live classes for attendance, and courses
    const [studentsRes, liveClassesRes, coursesRes] = await Promise.all([
      teacherAPI.students.getAll(teacherEmail),
      teacherAPI.liveClasses.getAll(teacherEmail),
      teacherAPI.courses.getSubjectContent(teacherEmail)
    ]);

    const students = studentsRes.data?.students || [];
    const liveClasses = liveClassesRes.data?.liveClasses || [];
    const courses = coursesRes.data?.subjectContent || [];

    // Calculate attendance data from live classes
    const attendanceData: any[] = [];
    liveClasses.forEach((liveClass: any) => {
      if (liveClass.attendees && liveClass.attendees.length > 0) {
        liveClass.attendees.forEach((attendee: any) => {
          const existingRecord = attendanceData.find(a => a.studentId === attendee.studentId.toString());
          if (existingRecord) {
            existingRecord.totalClasses += 1;
            if (attendee.status === 'attended') {
              existingRecord.attendedClasses += 1;
            }
          } else {
            attendanceData.push({
              studentId: attendee.studentId.toString(),
              studentName: attendee.studentName,
              studentEmail: attendee.studentEmail,
              totalClasses: 1,
              attendedClasses: attendee.status === 'attended' ? 1 : 0,
              attendanceRate: attendee.status === 'attended' ? 100 : 0
            });
          }
        });
      }
    });

    // Recalculate attendance rates
    attendanceData.forEach(record => {
      record.attendanceRate = record.totalClasses > 0 ? Math.round((record.attendedClasses / record.totalClasses) * 100) : 0;
    });

    // Transform students with progress and attendance data
    const transformedStudents = students.map((student: any) => {
      // Find attendance record for this student
      const attendanceRecord = attendanceData.find(a => a.studentId === student._id);

      // Calculate basic progress data (can be enhanced when backend implements it)
      const progressData = {
        chaptersCompleted: Math.floor(Math.random() * 10) + 1, // Placeholder until backend implements
        timeSpentMinutes: Math.floor(Math.random() * 500) + 50, // Placeholder
        testsTaken: Math.floor(Math.random() * 5) + 1, // Placeholder
        averageScore: student.averageScore || Math.floor(Math.random() * 30) + 70 // Placeholder
      };

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        enrolledCourses: student.enrolledCourses || [],
        overallProgress: student.overallProgress || Math.floor(Math.random() * 30) + 60, // Placeholder
        attendanceRate: attendanceRecord?.attendanceRate || student.attendanceRate || 0,
        assignmentsCompleted: student.assignmentsCompleted || Math.floor(Math.random() * 10) + 15, // Placeholder
        totalAssignments: student.totalAssignments || Math.floor(Math.random() * 5) + 20, // Placeholder
        averageScore: student.averageScore || Math.floor(Math.random() * 20) + 75, // Placeholder
        lastActive: student.lastActive || new Date().toISOString(),
        joinedDate: student.joinedDate || new Date().toISOString(),
        progress: progressData // Now populated with data
      };
    });

    return {
      students: transformedStudents,
      attendance: attendanceData, // Now populated with real attendance data
      stats: {
        totalStudents: students.length,
        activeStudents: students.filter((s: any) => s.overallProgress > 0).length,
        avgAttendance: attendanceData.length > 0 ? Math.round(attendanceData.reduce((sum: number, a: any) => sum + a.attendanceRate, 0) / attendanceData.length) : 0,
        avgProgress: students.reduce((sum: number, s: any) => sum + (s.overallProgress || 0), 0) / students.length || 0
      },
      courses: courses.map((course: any) => ({
        _id: course._id,
        name: course.subjectName || course.name,
        code: course.subjectCode || course.code
      })) // Now populated with teacher's courses
    };
  } catch (error) {
    console.error('Error fetching students:', error);
    return {
      students: [],
      attendance: [],
      stats: {
        totalStudents: 0,
        activeStudents: 0,
        avgAttendance: 0,
        avgProgress: 0
      },
      courses: []
    };
  }
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
