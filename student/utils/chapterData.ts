export interface Lesson {
  id: string;
  title: string;
  subtitle?: string; // short description or subtitle
  tags: { type: "live" | "video" | "notes"; label: string }[];
}

export interface Chapter {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  lessons: Lesson[];
}

export const chapters: Record<string, Chapter> = {
  "chapter-1": {
    title: "Chapter-1: Measurement and Units",
    subtitle: "Science",
    description:
      "In this chapter, you'll explore basic units of measurement like length, mass, and time, and learn how they are used in daily life and science.",
    duration: "≈ 60 days",
    lessons: [
      {
        id: "lesson-1.1",
        title: "1.1 Understanding and Converting Units of Length",
        subtitle: "Learn how to convert between meters, centimeters, and more.",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.2",
        title: "1.2 Introduction to Standard Units of Mass",
        subtitle: "Explore grams, kilograms, and their real-world uses.",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.3",
        title: "1.3 Derived Units: Meaning and Examples",
        subtitle: "Understand how new units are formed from base units.",
        tags: [
          { type: "live", label: "Live class" },
          { type: "notes", label: "Notes Readings" },
        ],
      },
      {
        id: "lesson-1.4",
        title: "1.4 Common Units of Volume and Capacity",
        subtitle: "Discover liters, milliliters, and their applications.",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.5",
        title: "1.5 Units of Heat and Temperature",
        subtitle: "Learn about Celsius, Fahrenheit, and Kelvin scales.",
        tags: [{ type: "video", label: "Recorded Video" }],
      },
      {
        id: "lesson-1.6",
        title: "1.6 Time Measurement: From Seconds to Years",
        subtitle: "Track time from the smallest to the largest units.",
        tags: [
          { type: "live", label: "Live class" },
          { type: "notes", label: "Notes Readings" },
        ],
      },
      {
        id: "lesson-1.7",
        title: "1.7 Accuracy, Precision, and Errors in Measurement",
        subtitle: "Master the difference between accuracy and precision.",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.8",
        title: "1.8 SI Units and Their Importance",
        subtitle: "Why SI units matter in science and daily life.",
        tags: [
          { type: "video", label: "Recorded Video" },
          { type: "notes", label: "Notes Readings" },
        ],
      },
      {
        id: "lesson-1.9",
        title: "1.9 Conversion Between Different Unit Systems",
        subtitle: "Switch between metric and imperial systems easily.",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.10",
        title: "1.10 Practical Applications of Measurement in Daily Life",
        subtitle: "See how measurement is used all around you.",
        tags: [
          { type: "notes", label: "Notes Readings" },
          { type: "video", label: "Recorded Video" },
        ],
      },
    ],
  },
  "chapter-2": {
    title: "Chapter-2: Force and Motion",
    subtitle: "Science",
    description: "Study how forces affect motion and explore Newton's laws...",
    duration: "≈ 40 mins",
    lessons: [
  { id: "lesson-2.1", title: "2.1 Force Basics", subtitle: "What is force? Learn the basics.", tags: [{ type: "video", label: "Recorded Video" }] },
  { id: "lesson-2.2", title: "2.2 Laws of Motion", subtitle: "Newton's laws explained simply.", tags: [{ type: "notes", label: "Notes Readings" }] },
    ],
  },
  "chapter-10": {
    title: "Chapter-10: Environment and Pollution",
    subtitle: "Science",
    description: "Explore environmental issues and pollution impacts...",
    duration: "≈ 50 mins",
    lessons: [
  { id: "lesson-10.1", title: "10.1 Air Pollution", subtitle: "Causes and effects of air pollution.", tags: [{ type: "video", label: "Recorded Video" }] },
  { id: "lesson-10.2", title: "10.2 Water Pollution", subtitle: "Understanding water pollution issues.", tags: [{ type: "notes", label: "Notes Readings" }] },
    ],
  },

  // Featured course as a chapter
  "learn-how-to-actually-study-before-it's-too-late": {
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
