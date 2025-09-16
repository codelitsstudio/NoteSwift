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

  // Sample lesson for featured course
  "module-1": {
    id: "module-1",
    title: "Study Fundamentals",
    description: "40-minute module guiding learners to create an optimal study environment and productive routine.",
    imageUri: "https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg",
    tags: [
      { label: "Live Class", type: "live", active: false },
      { label: "Video", type: "video", active: true },
      { label: "Attachments", type: "attachments", active: false },
    ],
transcript: [
  { time: "0:00 – 0:04", text: "This is student A. They study for 33 minutes a day, get eight hours of sleep," },
  { time: "0:04 – 0:08", text: "Maintain a social life, and consistently score in the top 5% of their class." },
  { time: "0:08 – 0:13", text: "They spend most of their study time taking practice tests and teaching concepts to classmates." },
  { time: "0:13 – 0:16", text: "This is student B. They study for four hours every day, sacrifice sleep," },
  { time: "0:16 – 0:20", text: "Rarely see friends, and still struggle to maintain a B average. They fill notebooks with" },
  { time: "0:20 – 0:24", text: "Highlighted text and spend hours rereading chapters. What's the difference between them?" },
  { time: "0:24 – 0:29", text: "It's not intelligence. It's not dedication. It's not even luck. It's how they study," },
  { time: "0:29 – 0:33", text: "Not how long they study. But before we start, I want you to take a second and rate your study" },
  { time: "0:33 – 0:38", text: "Method from one to ten. Got your number? Cool. By the end of this video, we'll see if you" },
  { time: "0:38 – 0:43", text: "Still think it deserves that score. Plus, I'm going to share the exact study plan that helped" },
  { time: "0:43 – 0:48", text: "Me go from getting B's and C's to straight A's. The night that changed everything." },
  { time: "0:48 – 0:52", text: "I remember sitting in my dorm room, especially during my junior year, empty coffee cups everywhere," },
  { time: "0:52 – 0:58", text: "Notebooks scattered across my desk. It was 3 a.m. and I'd been studying nonstop for 12 hours straight" },
  { time: "0:58 – 1:04", text: "for my psychology exam. I was doing everything right. Highlighting key points, rereading chapters," },
  { time: "1:04 – 1:10", text: "Writing detailed notes that looked aesthetically perfect, but deep down, something felt off." },
  { time: "1:10 – 1:14", text: "Despite all those hours, the information was slipping through my brain like sand through my" },
  { time: "1:14 – 1:20", text: "Fingers. That night changed everything for me. Not because I ace the test, but because I failed" },
  { time: "1:20 – 1:24", text: "Miserably. It forced me to face a hard truth. I had no clue how to study effectively." },
  { time: "1:25 – 1:30", text: "The Productivity Illusion. Think about it. We've all fallen into this trap. Drenching our textbooks" },
  { time: "1:30 – 1:35", text: "In highlighter ink until they look like abstract art, rereading the same paragraph 200 times," },
  { time: "1:35 – 1:39", text: "Hoping it'll finally stick, or writing pages of notes only to never look at them again." },
  { time: "1:39 – 1:44", text: "Just like those saved Instagram Reels, we never revisit. We confuse the time spent studying with" },
  { time: "1:44 – 1:48", text: "The amount we actually retain. You know you're in this trap when you spend more time picking the" },
  { time: "1:48 – 1:54", text: "perfect highlighter color than actually understanding the material. Or when you create the perfect" },
  { time: "1:54 – 1:59", text: "Study playlist, only to realize you spent more time curating it than studying, but nobody tells" },
  { time: "1:59 – 2:04", text: "Us this in school because studying isn't about time. It's about strategy. Let me break it down for" },
  { time: "2:04 – 2:10", text: "You. There's something called the consumption trap, the belief that the more information you consume," },
  { time: "2:10 – 2:14", text: "Reading more pages, watching more videos, cramming more hours, the more you learn." },
  { time: "2:14 – 2:19", text: "Schools reinforce this myth when teachers say things like study for three hours or review the" },
  { time: "2:19 – 2:24", text: "Entire chapter. But here's the catch. Your brain isn't a sponge that just absorbs info automatically." },
  { time: "2:24 – 2:29", text: "It's more like a muscle that needs training and rest to grow. Here's a formula that changed my" },
  { time: "2:29 – 2:33", text: "Entire approach to studying. Real learning equals amount of information times retention rate." },
  { time: "2:33 – 2:39", text: "Imagine two students. One studies for five hours, but retains only 10% of the material. The other" },
  { time: "2:39 – 2:44", text: "Studies for just one hour, but retains 50%. Both end up with the same amount of retained" },
  { time: "2:44 – 2:48", text: "Information, but the first student wasted four extra hours. If you study for five hours," },
  { time: "2:48 – 2:53", text: "And only retain 10%, you actually only benefited from 30 minutes of studying. But if you study for" },
  { time: "2:53 – 2:59", text: "Just one hour with a strategy that helps you retain 50%, you save time and energy. Now, what if I" },
  { time: "2:59 – 3:04", text: "Told you that studying less could actually improve your grades? Sounds crazy, right? Especially" },
  { time: "3:04 – 3:09", text: "When every YouTube video out there is screaming, study harder. Why are you so weak? Get up and study" },
  { time: "3:09 – 3:14", text: "Now. Yeah, no, shut up. The power of active learning. When I started studying less, my grades" },
  { time: "3:14 – 3:19", text: "Actually got better. Here's how. Before, I would spend hours rereading textbooks," },
  { time: "3:19 – 3:23", text: "Highlighting everything and rewriting notes, only to forget most of it. After, I switched to active" },
  { time: "3:23 – 3:28", text: "Learning using practice questions, explaining concepts to others and applying information to real" },
  { time: "3:28 – 3:34", text: "Life problems. Suddenly, my retention rate jumped from 10% to 70%. Passive studying is like" },
  { time: "3:34 – 3:38", text: "Trying to fill a bucket full of holes. You can keep pouring water in, but it'll never hold." },
  { time: "3:38 – 3:43", text: "The key is to patch the holes first so the knowledge actually stays. The result? My study time was" },
  { time: "3:43 – 3:48", text: "Cut in half and my grades went from B's and C's to straight A's. Now you're probably thinking," },
  { time: "3:48 – 3:53", text: "Okay, so how do I study less and actually retain more? Relax. I got you. Here's the exact" },
  { time: "3:53 – 3:58", text: "Study strategy that works. One, break study sessions into shorter chunks. 30 to 60 minutes per" },
  { time: "3:58 – 4:04", text: "Subject is ideal. Two, test yourself first before reviewing. Try recalling what you already know." },
  { time: "4:04 – 4:09", text: "Identify weak spots. Focus on the topics you struggle with. Four, use active study methods," },
  { time: "4:09 – 4:15", text: "Answer questions, explain concepts out loud, or use flashcards. Five connect ideas together." },
  { time: "4:15 – 4:20", text: "This makes information easier to retrieve later. Six quick review before bed. Your brain consolidates" },
  { time: "4:20 – 4:25", text: "Info while you sleep. Now go back to the number you rated your study habits at the start of this" },
  { time: "4:25 – 4:29", text: "Video. Do you still think it deserves that score? If not, that's your first sign that you're ready" },
  { time: "4:29 – 4:39", text: "To level up. Thanks for watching. See you in the next video." }
]

  },
};