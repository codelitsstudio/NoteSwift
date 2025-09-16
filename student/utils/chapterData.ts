export interface Lesson {
  id: string;
  title: string;
  subtitle?: string; // short description or subtitle
  tags: { type: "live" | "video" | "notes"; label: string }[];
}

export interface Chapter {
  _id?: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  lessons: Lesson[];
}

export const chapters: Record<string, Chapter> = {
  // Featured course as a chapter
  "learn-how-to-actually-study-before-it's-too-late": {
    _id: "68c40f5dcc006eb6c030a748",
    title: "Learn How To Actually Study Before It’s Too Late",
    subtitle: "ThatGuy (US) & NoteSwift Research Team",
    description: "Free, professional learning program for building effective study habits, improving knowledge retention, and mastering time management.",
    duration: "40 mins+",
   lessons: [
    {
      id: "module-1",
      title: "Foundations of Effective Studying",
      subtitle: "",
      tags: [
        { type: "video", label: "Recorded Video" },
        { type: "notes", label: "Notes & Reading Material" }
      ]
    },
    {
      id: "module-2",
      title: "Time Management and Productivity Techniques",
      subtitle: "Master your schedule and boost productivity.",
      tags: [
        { type: "video", label: "Recorded Video" },
        { type: "notes", label: "Notes & Reading Material" }
      ]
    },
    {
      id: "module-3",
      title: "Memory Enhancement and Knowledge Retention",
      subtitle: "Remember more, forget less.",
      tags: [
        { type: "video", label: "Recorded Video" },
        { type: "notes", label: "Notes & Reading Material" }
      ]
    },
    {
      id: "module-4",
      title: "Exam Preparation and Performance Strategies",
      subtitle: "Ace your exams with proven strategies.",
      tags: [
        { type: "video", label: "Recorded Video" },
        { type: "notes", label: "Notes & Reading Material" }
      ]
    },
    {
      id: "module-5",
      title: "Focus, Motivation, and Sustained Learning",
      subtitle: "Stay motivated and keep learning.",
      tags: [
        { type: "video", label: "Recorded Video" },
        { type: "notes", label: "Notes & Reading Material" }
      ]
    },
  ],
},
};
