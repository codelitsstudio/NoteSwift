// utils/lessonData.ts
export type Transcript = { time: string; text: string };
export type Tag = { label: string; type?: string; active?: boolean };
export type Lesson = {
  id: string;
  title: string;
  description?: string;
  imageUri?: string;
  tags?: Tag[];
  transcript?: Transcript[];
};

export const lessons: Record<string, Lesson> = {
  "lesson-1.1": {
    id: "lesson-1.1",
    title: "1.1 Understanding and Converting Units of Length",
    description:
      "Learn about different units used to measure length and how to easily convert from one unit to another.",
    imageUri: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    tags: [
      { label: "Live Class", type: "live", active: false },
      { label: "Video", type: "video", active: true },
      { label: "Notes", type: "notes", active: false },
      { label: "Attachments", type: "attachments", active: false },
    ],
    transcript: [
      { time: "0:00 – 2:00", text: "Welcome to today's lesson!..." },
      { time: "0:16 – 0:30", text: "Length is one of the most basic physical quantities..." },
      { time: "0:31 – 0:45", text: "There are different systems for measuring length..." },
    ],
  },
  "lesson-1.2": {
    id: "lesson-1.2",
    title: "1.2 Introduction to Standard Units of Mass",
    description: "Learn about mass and standard units used in measurement.",
    tags: [
      { label: "Live Class", type: "live" },
      { label: "Video", type: "video" },
    ],
  },
  // … add all other lessons similarly
};