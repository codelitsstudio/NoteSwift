import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Course from '@/lib/models/Course';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const courses = await Course.find({}).select('-__v').lean();
    return new Response(JSON.stringify({ success: true, result: { courses } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('courses fetch error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.type || !['free', 'pro', 'featured'].includes(body.type)) {
      return new Response(JSON.stringify({ success: false, error: 'Valid course type (free, pro, or featured) is required.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!body.program || !['SEE', '+2', 'Bachelor', 'CTEVT'].includes(body.program)) {
      return new Response(JSON.stringify({ success: false, error: 'Valid program (SEE, +2, Bachelor, or CTEVT) is required.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Set isFeatured based on type (all featured courses should be pro)
    body.isFeatured = body.type === 'featured';
    if (body.isFeatured) {
      body.type = 'pro';
    }

    // Ensure subjects is present and valid
    if (!Array.isArray(body.subjects) || body.subjects.length === 0 || !body.subjects[0].name) {
      return new Response(JSON.stringify({ success: false, error: 'At least one subject with a name is required.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Set price based on type
    if (body.type === 'free') {
      body.price = 0;
    } else if (!body.price && body.type === 'pro') {
      body.price = 1000; // Default pro course price
    }

    const course = new Course(body);
    await course.save();

    return new Response(JSON.stringify({ success: true, result: { course } }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('course create error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}