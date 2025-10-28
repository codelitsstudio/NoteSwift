import { generateAIResponse } from './src/ai/chat.js';

async function testAI() {
  console.log('🧪 Testing AI Service...\n');

  try {
    const testInput = {
      message: "Hello, can you explain what a variable is in programming?",
      courseContext: {
        courseId: "test-course",
        courseTitle: "Introduction to Programming",
        subjects: [{
          name: "Programming Fundamentals",
          description: "Basic programming concepts"
        }]
      },
      subjectContext: {
        subjectName: "Programming Fundamentals",
        subjectDescription: "Basic programming concepts"
      }
    };

    console.log('📤 Sending test request...');
    const result = await generateAIResponse(testInput);

    console.log('✅ AI Response received:');
    console.log('Response:', result.response);
    console.log('Suggestions:', result.suggestions);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAI();