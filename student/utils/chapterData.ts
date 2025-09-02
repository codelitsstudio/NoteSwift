export interface Lesson {
  id: string; // <-- added
  title: string;
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
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.2",
        title: "1.2 Introduction to Standard Units of Mass",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.3",
        title: "1.3 Derived Units: Meaning and Examples",
        tags: [
          { type: "live", label: "Live class" },
          { type: "notes", label: "Notes Readings" },
        ],
      },
      {
        id: "lesson-1.4",
        title: "1.4 Common Units of Volume and Capacity",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.5",
        title: "1.5 Units of Heat and Temperature",
        tags: [{ type: "video", label: "Recorded Video" }],
      },
      {
        id: "lesson-1.6",
        title: "1.6 Time Measurement: From Seconds to Years",
        tags: [
          { type: "live", label: "Live class" },
          { type: "notes", label: "Notes Readings" },
        ],
      },
      {
        id: "lesson-1.7",
        title: "1.7 Accuracy, Precision, and Errors in Measurement",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.8",
        title: "1.8 SI Units and Their Importance",
        tags: [
          { type: "video", label: "Recorded Video" },
          { type: "notes", label: "Notes Readings" },
        ],
      },
      {
        id: "lesson-1.9",
        title: "1.9 Conversion Between Different Unit Systems",
        tags: [
          { type: "live", label: "Live class" },
          { type: "video", label: "Recorded Video" },
        ],
      },
      {
        id: "lesson-1.10",
        title: "1.10 Practical Applications of Measurement in Daily Life",
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
      { id: "lesson-2.1", title: "2.1 Force Basics", tags: [{ type: "video", label: "Recorded Video" }] },
      { id: "lesson-2.2", title: "2.2 Laws of Motion", tags: [{ type: "notes", label: "Notes Readings" }] },
    ],
  },
  "chapter-10": {
    title: "Chapter-10: Environment and Pollution",
    subtitle: "Science",
    description: "Explore environmental issues and pollution impacts...",
    duration: "≈ 50 mins",
    lessons: [
      { id: "lesson-10.1", title: "10.1 Air Pollution", tags: [{ type: "video", label: "Recorded Video" }] },
      { id: "lesson-10.2", title: "10.2 Water Pollution", tags: [{ type: "notes", label: "Notes Readings" }] },
    ],
  },
};
